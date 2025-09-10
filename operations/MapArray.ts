import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";

export type MapArrayConfig = { path: string; map: "stringify" | "number" | "boolean" | "identity" };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    map: { enum: ["stringify", "number", "boolean", "identity"] },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: any, cfg: MapArrayConfig): any {
  const target = getByPath(input, cfg.path);
  if (!Array.isArray(target)) return input;
  let mapper: (x: any) => any = (x) => x;
  switch (cfg.map) {
    case "stringify":
      mapper = (x) => JSON.stringify(x);
      break;
    case "number":
      mapper = (x) => Number(x);
      break;
    case "boolean":
      mapper = (x) => Boolean(x);
      break;
    default:
      mapper = (x) => x;
  }
  const mapped = target.map(mapper);
  return setByPath(input, cfg.path, mapped);
}

function validate(config: MapArrayConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid MapArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<MapArrayConfig> = {
  type: "MapArray",
  apply,
  validate,
  defaultConfig: { path: "", map: "identity" },
};

export default mod;
