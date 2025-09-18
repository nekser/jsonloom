import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import type { JSONValue, JSONObject } from "../types/json";
import { writeResult } from "./writeResult";

export type MissingMode = "ignore" | "literal" | "error";
export type TemplateInterpolateConfig = { path: string; template: string; onMissing?: MissingMode; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    template: { type: "string", minLength: 1 },
    onMissing: { enum: ["ignore", "literal", "error"] },
    writeResultTo: { type: "string" },
  },
  required: ["path", "template"],
  additionalProperties: true,
});

// Support both ${path} and {{path}} placeholders. Using {{}} avoids config pre-resolution.
const PLACEHOLDER_RE = /\$\{([^}]+)\}|\{\{([^}]+)\}\}/g;

function readPath(root: JSONValue, path: string): JSONValue {
  return path.split(".").reduce<JSONValue | undefined>((acc, seg) => {
    if (acc == null) return acc as undefined;
    if (Array.isArray(acc)) return (acc as unknown as Record<string, JSONValue>)[seg];
    if (typeof acc === "object") return (acc as JSONObject)[seg];
    return undefined as unknown as JSONValue;
  }, root as JSONValue) as JSONValue;
}

function interpolate(template: string, root: JSONValue, onMissing: MissingMode = "literal"): string {
  return template.replace(PLACEHOLDER_RE, (match: string, p1?: string, p2?: string) => {
    const p = (p1 ?? p2 ?? "").trim();
    const v = readPath(root, p);
    if (v === undefined) {
      if (onMissing === "ignore") return "";
      if (onMissing === "error") throw new Error(`Missing placeholder: ${p}`);
      // literal mode: keep original placeholder unchanged
      return match;
    }
    return String(v);
  });
}

function apply(input: JSONValue, cfg: TemplateInterpolateConfig): JSONValue {
  const root = input;
  const target = getByPath(root, cfg.path);
  const out = interpolate(cfg.template, root, cfg.onMissing ?? "literal");
  const result = typeof target === "string" ? target.replace(/^[\s\S]*$/, out) : out;
  const updated = setByPath(input, cfg.path, result as unknown as JSONValue);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => result as unknown as JSONValue });
}

function validate(config: TemplateInterpolateConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid TemplateInterpolate config";
  try {
    // Dry-run interpolation to surface missing placeholder errors in 'error' mode
    interpolate(config.template, input, config.onMissing ?? "literal");
  } catch (e: unknown) {
    return (e as { message?: string })?.message ?? "Interpolation failed";
  }
}

const mod: OperationModule<TemplateInterpolateConfig> = {
  type: "TemplateInterpolate",
  apply,
  validate,
  defaultConfig: { path: "", template: "", onMissing: "literal", writeResultTo: undefined },
};

export default mod;
