type Cfg = { path?: string };
import { accessExpr } from "../utils/pathResolution";

export default function TrimStrings(cfg: Cfg, varName: string): string {
  const tgt = cfg.path ? accessExpr("python", varName, cfg.path) : varName;
  return `# TrimStrings${cfg.path ? ` at path ${cfg.path}` : " globally"}
def __ts(v):
  if isinstance(v, str):
    return v.strip()
  if isinstance(v, list):
    return [__ts(x) for x in v]
  if isinstance(v, dict):
    return {k: __ts(val) for k, val in v.items()}
  return v

${tgt} = __ts(${tgt})`;
}
