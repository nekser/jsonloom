type Cfg = { path: string; compareTo: string | { path: string }; op: "after"|"afterOrEqual"|"before"|"beforeOrEqual"; resultPath?: string };
import { accessExpr } from "../utils/pathResolution";

export default function IsDateCompare(cfg: Cfg, varName: string): string {
  const a = accessExpr("python", varName, cfg.path);
  const bExpr = typeof cfg.compareTo === "string" ? JSON.stringify(cfg.compareTo) : accessExpr("python", varName, cfg.compareTo?.path || "");
  const resTarget = cfg.resultPath ? accessExpr("python", varName, cfg.resultPath) : a;
  const op = cfg.op;
  let cmp: string;
  if (op === "after") cmp = "da > db";
  else if (op === "afterOrEqual") cmp = "da >= db";
  else if (op === "before") cmp = "da < db";
  else cmp = "da <= db";
  return `# IsDateCompare (${op})
from datetime import datetime

def __parse_iso(s):
    try:
        # Basic ISO parse; extend as needed
        return datetime.fromisoformat(str(s).replace('Z', '+00:00'))
    except Exception:
        return None

_a_val = __parse_iso(${a})
_b_val = __parse_iso(${bExpr})
__ok = (_a_val is not None) and (_b_val is not None)
__res = (${cmp}) if __ok else False
${resTarget} = __res`;
}
