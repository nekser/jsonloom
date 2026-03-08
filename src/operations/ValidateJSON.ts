import Ajv, { type AnySchema, type ErrorObject, type ValidateFunction } from "ajv";
import type { JSONValue } from "../types/json";
import type { OperationModule } from "./types";
import { getByPath } from "./utils";
import { inferJsonSchema } from "@/src/utils/inferJsonSchema";

export type ValidateJSONConfig = {
  path?: string;
  schema?: AnySchema;
  failOnError?: boolean; // default true
  generateSchema?: boolean; // default false, set by UI button
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

function toArray<T>(v: T | T[]): T[] {
  return Array.isArray(v) ? v : [v];
}

function mergeSchemas(schemas: AnySchema[]): AnySchema {
  const seen = new Set<string>();
  const uniq: AnySchema[] = [];
  for (const s of schemas) {
    const key = JSON.stringify(s);
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(s);
    }
  }
  if (uniq.length === 0) return {} as AnySchema;
  if (uniq.length === 1) return uniq[0] as AnySchema;
  return { anyOf: uniq } as unknown as AnySchema;
}

function stripDollarSchema(schema: AnySchema): AnySchema {
  if (typeof schema === "boolean") return schema;
  if (!schema || typeof schema !== "object") return schema as AnySchema;
  const out: Record<string, unknown> = { ...(schema as unknown as Record<string, unknown>) };
  if ("$schema" in out) delete out["$schema"];
  if (Array.isArray(out.anyOf)) {
    out.anyOf = (out.anyOf as unknown[]).map((s) =>
      typeof s === "boolean" ? s : stripDollarSchema(s as AnySchema)
    ) as unknown;
  }
  return out as unknown as AnySchema;
}

function apply(input: JSONValue, cfg: ValidateJSONConfig): JSONValue {
  const target = cfg.path ? getByPath(input, cfg.path) : input;
  // 1) Manual schema present -> validate with it
  const hasManualSchema = !!(cfg.schema && (typeof cfg.schema !== "object" || Object.keys(cfg.schema as Record<string, unknown>).length > 0));
  if (hasManualSchema) {
    const { validate, error } = compileSchema(cfg.schema);
    if (error) throw new Error(error);
    if (!validate) return input; // empty
    const ok = validate(target as unknown);
    if (ok) return input;
    const message = formatErrors(validate.errors);
    if (cfg.failOnError ?? true) throw new Error(message || "JSON Schema validation failed");
    return input;
  }

  // 2) No manual schema: if generateSchema flagged, infer from data and validate
  if (cfg.generateSchema) {
    // getByPath may return a single value or an array of matches (wildcards)
    const matches = toArray(target as JSONValue | JSONValue[]);
    const inferred = matches.map((m) => stripDollarSchema(inferJsonSchema(m as unknown) as AnySchema));
    const combined = mergeSchemas(inferred);

    const { validate, error } = compileSchema(combined);
    if (error) throw new Error(error);
    if (!validate) return input;
    const ok = validate(target as unknown);
    if (ok) return input;
    const message = formatErrors(validate.errors);
    if (cfg.failOnError ?? true) throw new Error(message || "JSON Schema validation failed");
    return input;
  }

  // 3) Neither manual schema nor generation requested -> surface a helpful message
  throw new Error("No schema provided. Paste a schema or click Generate Schema.");
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
  defaultConfig: { path: "", schema: {}, failOnError: true, generateSchema: false },
};

export default mod;
