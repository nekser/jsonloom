type Cfg = { path: string; format?: string };
import { accessExpr } from "../utils/pathResolution";

export default function ParseDate(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  // Best-effort: strtotime handles many formats; ignore format for simplicity
  return `${t} = date('c', strtotime(${t}));`;
}
