import Ajv, { type ErrorObject, type ValidateFunction, type AnySchema } from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { getByPath } from "./utils";

export type ValidateJSONConfig = {
  path?: string;
  schema?: AnySchema;
  failOnError?: boolean; // default true
};

const ajv = new Ajv({ allErrors: true, strict: false });

function compileSchema(schema: AnySchema | undefined): { validate?: ValidateFunction<unknown>; error?: string } {
  if (!schema || (typeof schema === "object" && Object.keys(schema as Record<string, unknown>).length === 0)) return {}; // empty schema → accept anything
  try {
    const v = ajv.compile(schema);
    return { validate: v };
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message || "Invalid JSON Schema";
    return { error: msg };
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

function apply(input: JSONValue, cfg: ValidateJSONConfig): JSONValue {
  const target = cfg.path ? getByPath(input, cfg.path) : input;
  const { validate, error } = compileSchema(cfg.schema);
  if (error) throw new Error(error);
  if (!validate) return input; // empty schema
  const ok = validate(target as unknown);
  if (ok) return input;
  const message = formatErrors(validate.errors);
  if (cfg.failOnError ?? true) throw new Error(message || "JSON Schema validation failed");
  // Non-fatal: pass through unchanged
  return input;
}

function validate(config: ValidateJSONConfig, _input: JSONValue): string | undefined {
  // Basic shape only; compile schema here for early feedback
  const { error } = compileSchema(config.schema);
  if (error) return error;
}

const mod: OperationModule<ValidateJSONConfig> = {
  type: "ValidateJSON",
  apply,
  validate,
  defaultConfig: { path: "", schema: {}, failOnError: true },
};

export default mod;
