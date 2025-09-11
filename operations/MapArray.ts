import Ajv from "ajv";
import type { OperationModule, Operation, OperationType } from "./types";
import { getByPath, setByPath } from "./utils";
import { getOperationModule } from "./index";

export type MapArrayConfig = {
  path: string;
  // Nested pipeline to apply to each element
  operations?: Operation[];
  // Error handling strategy for per-element failures
  onError?: "propagate" | "skip";
  // Safety guard for nested recursion
  maxDepth?: number;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    operations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          config: { type: "object" },
        },
        required: ["id", "type", "config"],
        additionalProperties: true,
      },
    },
    onError: { enum: ["propagate", "skip"] },
    maxDepth: { type: "integer", minimum: 1 },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: any, cfg: MapArrayConfig): any {
  const target = getByPath(input, cfg.path);
  if (!Array.isArray(target)) return input;

  const onError = cfg.onError ?? "propagate";
  const maxDepth = cfg.maxDepth ?? 20;

  const runNested = (val: any, ops: Operation[] | undefined, depth: number): any => {
    if (!ops || ops.length === 0) return val;
    if (depth > maxDepth) throw new Error(`MapArray nested depth exceeded (${maxDepth})`);
    let cur = val;
    for (const op of ops) {
      const mod = getOperationModule(op.type as OperationType);
      if (!mod) throw new Error(`Nested operation type '${op.type}' is not registered`);
  // If the operation supports a 'path' field, default empty/undefined to current context '.'
  const hasPathField = op && op.config && Object.prototype.hasOwnProperty.call(op.config, "path");
  const defaultHasPath = mod && mod.defaultConfig && Object.prototype.hasOwnProperty.call(mod.defaultConfig as any, "path");
  const needsDot = (hasPathField && ((op.config as any).path == null || (op.config as any).path === "")) || (defaultHasPath && (op.config as any).path == null);
  const effectiveConfig = needsDot ? { ...(op.config as any), path: "." } : (op.config as any);
  const err = mod.validate(effectiveConfig, cur);
      if (err) throw new Error(err);
  cur = mod.apply(cur, effectiveConfig);
    }
    return cur;
  };

  const out = target.reduce<any[]>((acc, el) => {
    try {
  const mapped = runNested(el, cfg.operations, 1);
      acc.push(mapped);
    } catch (e) {
      if (onError === "skip") {
        // omit this element
        return acc;
      }
      // propagate
      throw e;
    }
    return acc;
  }, []);

  return setByPath(input, cfg.path, out);
}

function validate(config: MapArrayConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid MapArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
  // Validate nested operations (structure + first element if present)
  if (config.operations && !Array.isArray(config.operations)) return "'operations' must be an array";
  if (config.operations && config.operations.length > 0) {
    for (const op of config.operations) {
      if (typeof op?.type !== "string") return "Nested operation missing type";
      const mod = getOperationModule(op.type as OperationType);
      if (!mod) return `Nested operation type '${op.type}' is not registered`;
    }
    if (arr.length > 0) {
      // Validate against first element to catch obvious mismatches
      const sample = arr[0];
      for (const op of config.operations) {
        const mod = getOperationModule(op.type as OperationType);
        const err = mod.validate(op.config as any, sample);
        if (err) return `Nested op '${op.type}' invalid: ${err}`;
      }
    }
  }
}

const mod: OperationModule<MapArrayConfig> = {
  type: "MapArray",
  apply,
  validate,
  defaultConfig: { path: "", operations: [], onError: "propagate" },
};

export default mod;
