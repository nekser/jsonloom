import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";

export type Base64Mode = "encode" | "decode";
export type Base64Config = {
  path: string;
  mode: Base64Mode;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    mode: { enum: ["encode", "decode"] },
  },
  required: ["path", "mode"],
  additionalProperties: true,
});

function apply(input: any, cfg: Base64Config): any {
  const cur = getByPath(input, cfg.path);
  if (cfg.mode === "encode") {
    const s = cur == null ? "" : String(cur);
    const out = typeof Buffer !== "undefined" ? Buffer.from(s, "utf8").toString("base64") : btoa(unescape(encodeURIComponent(s)));
    return setByPath(input, cfg.path, out);
  } else {
    try {
      const s = cur == null ? "" : String(cur);
      const out = typeof Buffer !== "undefined" ? Buffer.from(s, "base64").toString("utf8") : decodeURIComponent(escape(atob(s)));
      return setByPath(input, cfg.path, out);
    } catch {
      return input;
    }
  }
}

function validate(config: Base64Config, input: any): string | undefined {
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
  defaultConfig: { path: "", mode: "encode" },
};

export default mod;
