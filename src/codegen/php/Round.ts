type Cfg = { path: string; digits?: number };
import { accessExpr } from "../utils/pathResolution";
export default function Round(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const d = cfg.digits ?? 0;
  return `${t} = round(${t}, ${d});`;
}
