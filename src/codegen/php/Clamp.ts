type Cfg = { path: string; min?: number; max?: number };
import { accessExpr } from "../utils/pathResolution";
export default function Clamp(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const min = cfg.min ?? "-INF";
  const max = cfg.max ?? "INF";
  return `${t} = max(${typeof min === "number" ? min : min}, min(${typeof max === "number" ? max : max}, ${t}));`;
}
