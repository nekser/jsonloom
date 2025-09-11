import Ajv, { ErrorObject } from "ajv";
import type { OperationModule } from "./types";
import { getByPath } from "./utils";

export type ValidateJSONConfig = {
  path?: string;
  schema?: any;
  failOnError?: boolean; // default true
};

const ajv = new Ajv({ allErrors: true, strict: false });

function compileSchema(schema: any): { validate?: (data: any) => boolean; error?: string } {
  if (!schema || (typeof schema === "object" && Object.keys(schema).length === 0)) return {}; // empty schema → accept anything
  try {
    const v = ajv.compile(schema);
    return { validate: v };
  } catch (e: any) {
    return { error: e?.message || "Invalid JSON Schema" };
  }
}

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors || errors.length === 0) return "";
  return errors
    .map((e) => {
      const path = e.instancePath || e.schemaPath;
      const msg = e.message || "Invalid";
      return `${path}: ${msg}`;
    })
    .join("; ");
}

function apply(input: any, cfg: ValidateJSONConfig): any {
  const target = cfg.path ? getByPath(input, cfg.path) : input;
  const { validate, error } = compileSchema(cfg.schema);
  if (error) throw new Error(error);
  if (!validate) return input; // empty schema
  const ok = (validate as any)(target);
  if (ok) return input;
  const message = formatErrors((validate as any).errors);
  if (cfg.failOnError ?? true) throw new Error(message || "JSON Schema validation failed");
  // Non-fatal: pass through unchanged
  return input;
}

function validate(config: ValidateJSONConfig, input: any): string | undefined {
  // Basic shape only; compile schema here for early feedback
  const { error } = compileSchema(config.schema);
  if (error) return error;
}

const mod: OperationModule<ValidateJSONConfig> = {
  type: "ValidateJSON" as any,
  apply,
  validate,
  defaultConfig: { path: "", schema: {}, failOnError: true },
};

export default mod;
