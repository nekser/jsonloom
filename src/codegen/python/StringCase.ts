type Cfg = { path: string; mode: "lowercase" | "uppercase"; coerceNonString?: boolean };
import { accessExpr } from "../utils/pathResolution";

export default function StringCase(cfg: Cfg, varName: string): string {
  const target = accessExpr("python", varName, cfg.path);
  const toUpper = cfg.mode === "uppercase";
  const coerce = !!cfg.coerceNonString;
  return `# StringCase (${cfg.mode})
def __sc_apply(s):
  return str(s).upper() if ${toUpper ? "True" : "False"} else str(s).lower()

def __sc_map(v):
  if isinstance(v, str):
    return __sc_apply(v)
  if ${coerce ? "True" : "False"}:
    return __sc_apply(v)
  if isinstance(v, list):
    return [__sc_map(x) for x in v]
  if isinstance(v, dict):
    return {k: __sc_map(val) for k, val in v.items()}
  return v

${target} = __sc_map(${target})`;
}
