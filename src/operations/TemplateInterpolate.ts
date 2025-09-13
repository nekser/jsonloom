import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";

export type MissingMode = "ignore" | "literal" | "error";
export type TemplateInterpolateConfig = {
  path: string;
  template: string;
  onMissing?: MissingMode; // default: literal
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    template: { type: "string", minLength: 1 },
    onMissing: { enum: ["ignore", "literal", "error"] },
  },
  required: ["path", "template"],
  additionalProperties: true,
});

const PLACEHOLDER_RE = /\$\{([^}]+)\}/g;

function readPath(root: any, path: string): any {
  return path.split(".").reduce((acc, seg) => (acc == null ? acc : (acc as any)[seg]), root);
}

function interpolate(template: string, root: any, onMissing: MissingMode = "literal"): string {
  return template.replace(PLACEHOLDER_RE, (_, p: string) => {
    const v = readPath(root, p.trim());
    if (v === undefined) {
      if (onMissing === "ignore") return "";
      if (onMissing === "error") throw new Error(`Missing placeholder: ${p}`);
      return `\${${p}}`;
    }
    return String(v);
  });
}

function apply(input: any, cfg: TemplateInterpolateConfig): any {
  const root = input;
  const target = getByPath(root, cfg.path);
  const out = interpolate(cfg.template, root, cfg.onMissing ?? "literal");
  const result = typeof target === "string" ? target.replace(/^[\s\S]*$/, out) : out;
  return setByPath(input, cfg.path, result);
}

function validate(config: TemplateInterpolateConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid TemplateInterpolate config";
  try {
    // Dry-run interpolation to surface missing placeholder errors in 'error' mode
    interpolate(config.template, input, config.onMissing ?? "literal");
  } catch (e: any) {
    return e?.message ?? "Interpolation failed";
  }
}

const mod: OperationModule<TemplateInterpolateConfig> = {
  type: "TemplateInterpolate",
  apply,
  validate,
  defaultConfig: { path: "", template: "", onMissing: "literal" },
};

export default mod;
