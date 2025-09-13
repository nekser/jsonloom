type Cfg = { path: string; value: number };
import { accessExpr } from "../utils/pathResolution";
export default function Add(cfg: Cfg, varName: string): string {
  const t = accessExpr("javascript", varName, cfg.path);
  return `${t} = ${t} + ${cfg.value}`;
}
