import Ajv from "ajv";
import type { OperationModule } from "./types";

export type RenameKeyConfig = { from: string; to: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: { from: { type: "string", minLength: 1 }, to: { type: "string", minLength: 1 } },
  required: ["from", "to"],
  additionalProperties: true,
});

function apply(input: any, cfg: RenameKeyConfig): any {
  if (input === null || typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map((x) => apply(x, cfg));
  const out: any = {};
  for (const [k, v] of Object.entries(input)) {
    const key = k === cfg.from ? cfg.to : k;
    out[key] = apply(v, cfg);
  }
  return out;
}

function validate(config: RenameKeyConfig): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid RenameKey config";
}

const mod: OperationModule<RenameKeyConfig> = {
  type: "RenameKey",
  apply,
  validate,
  defaultConfig: { from: "", to: "" },
};

export default mod;
