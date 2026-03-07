import type { JSONValue, JSONObject } from "@/src/types/json";
import { isJSONObject, isJSONValue } from "@/src/types/json";
import type { Operation } from "@/src/operations/types";

export type ConfigPatch = Partial<Record<string, JSONValue | undefined>>;

export function asConfigObject(value: unknown): JSONObject {
  if (!isJSONObject(value)) return {};
  const out: JSONObject = {};
  for (const [key, val] of Object.entries(value)) {
    if (isJSONValue(val)) out[key] = val;
  }
  return out;
}

export function toConfigPatch(value: unknown): ConfigPatch {
  if (!isJSONObject(value)) return {};
  const out: ConfigPatch = {};
  for (const [key, val] of Object.entries(value)) {
    if (val === undefined || isJSONValue(val)) out[key] = val;
  }
  return out;
}

export function mergeConfigPatch(baseConfig: unknown, patch: ConfigPatch): JSONObject {
  const merged: ConfigPatch = { ...asConfigObject(baseConfig), ...patch };
  const out: JSONObject = {};
  for (const [key, val] of Object.entries(merged)) {
    if (val !== undefined) out[key] = val;
  }
  return out;
}

export function applyOperationPatch(op: Operation, patch: Partial<Operation>): Operation {
  const base: Operation = { ...op, ...patch };
  if (patch.config === undefined) return base;

  if (isJSONObject(op.config) && isJSONObject(patch.config)) {
    base.config = mergeConfigPatch(op.config, toConfigPatch(patch.config));
    return base;
  }

  if (isJSONValue(patch.config)) {
    base.config = patch.config;
    return base;
  }

  return base;
}
