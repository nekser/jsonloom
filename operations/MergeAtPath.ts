import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { mergeObjects, type MergeStrategy } from "./objectUtils";

export type MergeAtPathConfig = {
  path: string;
  source: "root" | "path";
  sourcePath?: string; // required if source = path
  strategy?: MergeStrategy; // shallow | deep | overwrite
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    source: { enum: ["root", "path"] },
    sourcePath: { type: "string" },
    strategy: { enum: ["shallow", "deep", "overwrite"] },
  },
  required: ["path", "source"],
  additionalProperties: true,
});

function apply(input: any, cfg: MergeAtPathConfig): any {
  const target = getByPath(input, cfg.path);
  const src = cfg.source === "root" ? input : getByPath(input, cfg.sourcePath || "");
  const strategy = cfg.strategy ?? "shallow";
  if (!(target && typeof target === "object" && !Array.isArray(target))) return input;
  if (!(src && typeof src === "object" && !Array.isArray(src))) return input;
  const merged = mergeObjects(target, src, strategy);
  return setByPath(input, cfg.path, merged);
}

function validate(config: MergeAtPathConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid MergeAtPath config";
  if (config.source === "path" && !config.sourcePath) return "sourcePath is required when source=path";
  const target = getByPath(input, config.path);
  if (!(target && typeof target === "object" && !Array.isArray(target))) return `Path '${config.path}' is not an object`;
  const src = config.source === "root" ? input : getByPath(input, config.sourcePath || "");
  if (!(src && typeof src === "object" && !Array.isArray(src))) return `Source is not an object`;
}

const mod: OperationModule<MergeAtPathConfig> = {
  type: "MergeAtPath" as any,
  apply,
  validate,
  defaultConfig: { path: "", source: "root", strategy: "shallow" },
};

export default mod;
