import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { deepStringReplace, getByPath, setByPath } from "./utils";
import { writeResult } from "./writeResult";
export type StringReplaceConfig = { path?: string; search: string; replace: string; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string" },
    search: { type: "string" },
    replace: { type: "string" },
    writeResultTo: { type: "string" },
  },
  required: ["search", "replace"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: StringReplaceConfig): JSONValue {
  const search = cfg.search ?? "";
  const replace = cfg.replace ?? "";
  if (!cfg.path) {
    const outAll = deepStringReplace(input, search, replace) as JSONValue;
    return writeResult(input, outAll, { writeResultTo: cfg.writeResultTo, valueExtractor: () => outAll });
  }
  const target = getByPath(input, cfg.path);
  const replaceStr = (s: JSONValue) => (typeof s === "string" ? (s as string).split(search).join(replace) : s);
  if (typeof target === "string") {
    const out = replaceStr(target) as JSONValue;
    const updated = setByPath(input, cfg.path, out);
    return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
  }
  if (Array.isArray(target)) {
    const out = target.map(replaceStr) as unknown as JSONValue;
    const updated = setByPath(input, cfg.path, out);
    return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
  }
  if (target && typeof target === "object") {
    const out = deepStringReplace(target, search, replace) as JSONValue;
    const updated = setByPath(input, cfg.path, out);
    return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
  }
  return input;
}

function validate(config: StringReplaceConfig): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid StringReplace config";
}

const mod: OperationModule<StringReplaceConfig> = {
  type: "StringReplace",
  apply,
  validate,
  defaultConfig: { path: "", search: "", replace: "", writeResultTo: undefined },
};

export default mod;
