import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { deepStringReplace, getByPath, setByPath } from "./utils";
export type StringReplaceConfig = { path?: string; search: string; replace: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string" },
    search: { type: "string" },
    replace: { type: "string" },
  },
  required: ["search", "replace"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: StringReplaceConfig): JSONValue {
  const search = cfg.search ?? "";
  const replace = cfg.replace ?? "";
  if (!cfg.path) return deepStringReplace(input, search, replace);
  const target = getByPath(input, cfg.path);
  const replaceStr = (s: JSONValue) => (typeof s === "string" ? (s as string).split(search).join(replace) : s);
  if (typeof target === "string") return setByPath(input, cfg.path, replaceStr(target));
  if (Array.isArray(target)) return setByPath(input, cfg.path, target.map(replaceStr));
  if (target && typeof target === "object") return setByPath(input, cfg.path, deepStringReplace(target, search, replace));
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
  defaultConfig: { path: "", search: "", replace: "" },
};

export default mod;
