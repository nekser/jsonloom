import type { JSONValue } from "../types/json";
import { setByPath } from "./utils";

// Helper to route an operation's computed value to a target path if provided.
// Semantics:
// - If writeResultTo is falsy/empty: caller should have already returned a full root object; we just return computedRoot
// - If writeResultTo provided: we interpret computedValue as the meaningful output of the op and set it at the given path on the ORIGINAL input
//   (not on the mutated root) to avoid accidental double-application.
//   This enables using transformation result without overwriting the original location.
export function writeResult(
  originalRoot: JSONValue,
  computedRoot: JSONValue,
  opts: { writeResultTo?: string; valueExtractor?: (original: JSONValue, resultRoot: JSONValue) => JSONValue }
): JSONValue {
  const { writeResultTo, valueExtractor } = opts;
  if (!writeResultTo) return computedRoot;
  const val = valueExtractor ? valueExtractor(originalRoot, computedRoot) : computedRoot;
  return setByPath(originalRoot, writeResultTo, val);
}
