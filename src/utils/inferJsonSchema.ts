import type { AnySchema } from "ajv";

function uniqueSchemas(schemas: AnySchema[]): AnySchema[] {
  const seen = new Set<string>();
  const out: AnySchema[] = [];
  for (const schema of schemas) {
    const key = JSON.stringify(schema);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(schema);
  }
  return out;
}

export function inferJsonSchema(value: unknown): AnySchema {
  if (value === null) return { type: "null" } as AnySchema;
  if (typeof value === "string") return { type: "string" } as AnySchema;
  if (typeof value === "boolean") return { type: "boolean" } as AnySchema;
  if (typeof value === "number") {
    return { type: Number.isInteger(value) ? "integer" : "number" } as AnySchema;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return { type: "array", items: {} } as AnySchema;
    const itemSchemas = uniqueSchemas(value.map((item) => inferJsonSchema(item)));
    const items = itemSchemas.length === 1 ? itemSchemas[0] : ({ anyOf: itemSchemas } as AnySchema);
    return { type: "array", items } as AnySchema;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const properties: Record<string, AnySchema> = {};
    for (const [k, v] of entries) properties[k] = inferJsonSchema(v);
    const required = entries.map(([k]) => k);
    return {
      type: "object",
      properties,
      required,
      additionalProperties: false,
    } as AnySchema;
  }

  return {} as AnySchema;
}
