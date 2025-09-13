// Canonical JSON value types used across operations
export type JSONPrimitive = string | number | boolean | null;
// Recursive JSON type: objects or arrays of JSONValue
export type JSONValue = JSONPrimitive | JSONObject | JSONValue[];
export interface JSONObject {
  [k: string]: JSONValue;
}
export type JSONArray = JSONValue[];

export function isJSONObject(v: unknown): v is JSONObject {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export function isJSONArray(v: unknown): v is JSONArray {
  return Array.isArray(v);
}
