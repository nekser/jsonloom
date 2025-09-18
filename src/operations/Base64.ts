import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { getByPath, setByPath } from "./utils";
import { writeResult } from "./writeResult";

export type Base64Mode = "encode" | "decode";
export type Base64Config = { path: string; mode: Base64Mode; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    mode: { enum: ["encode", "decode"] },
    writeResultTo: { type: "string" },
  },
  required: ["path", "mode"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: Base64Config): JSONValue {
  const cur = getByPath(input, cfg.path);
  if (cfg.mode === "encode") {
    const s = cur == null ? "" : String(cur);
    const out = (typeof Buffer !== "undefined" ? Buffer.from(s, "utf8").toString("base64") : btoa(unescape(encodeURIComponent(s)))) as JSONValue;
    const updated = setByPath(input, cfg.path, out);
    return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
  } else {
    try {
      const s = cur == null ? "" : String(cur);
      const out = (typeof Buffer !== "undefined" ? Buffer.from(s, "base64").toString("utf8") : decodeURIComponent(escape(atob(s)))) as JSONValue;
      const updated = setByPath(input, cfg.path, out);
      return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
    } catch {
      return input;
    }
  }
}

function validate(config: Base64Config, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid Base64 config";
  const cur = getByPath(input, config.path);
  if (config.mode === "decode") {
    try {
      const s = cur == null ? "" : String(cur);
      if (typeof Buffer !== "undefined") Buffer.from(s, "base64");
      else atob(s);
    } catch {
      return `Invalid Base64 string at '${config.path}'`;
    }
  }
}

const mod: OperationModule<Base64Config> = {
  type: "Base64",
  apply,
  validate,
  defaultConfig: { path: "", mode: "encode", writeResultTo: undefined },
};

export default mod;
