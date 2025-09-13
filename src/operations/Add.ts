import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath } from "./utils";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";

export type AddConfig = { path: string; value: number };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, value: { type: "number" } },
  required: ["path", "value"],
  additionalProperties: false,
});

function apply(input: any, cfg: AddConfig): any {
  return applyNumberAtPath(input, cfg.path, (n) => n + cfg.value);
}
function validate(cfg: AddConfig, input: any): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Add config";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<AddConfig> = { type: "Add" as any, apply, validate, defaultConfig: { path: "", value: 0 } };
export default mod;
