import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { getByPath, setByPath } from "./utils";
import { mergeObjects, type MergeStrategy } from "./objectUtils";
import { writeResult } from "./writeResult";

export type MergeAtPathConfig = { path: string; source: "root" | "path"; sourcePath?: string; strategy?: MergeStrategy; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    source: { enum: ["root", "path"] },
    sourcePath: { type: "string" },
    strategy: { enum: ["shallow", "deep", "overwrite"] },
    writeResultTo: { type: "string" },
  },
  required: ["path", "source"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: MergeAtPathConfig): JSONValue {
  const target = getByPath(input, cfg.path);
  let src = cfg.source === "root" ? input : getByPath(input, cfg.sourcePath || "");
  const strategy = cfg.strategy ?? "shallow";
  if (!(target && typeof target === "object" && !Array.isArray(target))) return input;
  if (!(src && typeof src === "object" && !Array.isArray(src))) return input;
  // When merging from root into target, avoid self-reference causing nested 'target' key merged in
  if (cfg.source === "root") {
    // Create a shallow copy excluding the target path key if it exists directly on root
    const isObj = (o: unknown) => o && typeof o === "object" && !Array.isArray(o);
    if (isObj(src)) {
      const rootObj = { ...(src as Record<string, unknown>) } as Record<string, unknown>;
      const topKey = (cfg.path || "").split(".")[0];
      if (topKey && Object.prototype.hasOwnProperty.call(rootObj, topKey)) {
        delete rootObj[topKey];
      }
      src = rootObj as unknown as JSONValue;
    }
  }
  const merged = mergeObjects(target as Record<string, JSONValue>, src as Record<string, JSONValue>, strategy) as JSONValue;
  const updated = setByPath(input, cfg.path, merged);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => merged });
}

function validate(config: MergeAtPathConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid MergeAtPath config";
  if (config.source === "path" && !config.sourcePath) return "sourcePath is required when source=path";
  const target = getByPath(input, config.path);
  if (!(target && typeof target === "object" && !Array.isArray(target))) return `Path '${config.path}' must be an object`;
  const src = config.source === "root" ? input : getByPath(input, config.sourcePath || "");
  if (!(src && typeof src === "object" && !Array.isArray(src))) return `Source is not an object`;
}

const mod: OperationModule<MergeAtPathConfig> = {
  type: "MergeAtPath",
  apply,
  validate,
  defaultConfig: { path: "", source: "root", strategy: "shallow", writeResultTo: undefined },
};

export default mod;
