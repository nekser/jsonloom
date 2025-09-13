type Cfg = { path: string; value: number };
import { accessExpr } from "../utils/pathResolution";
export default function Divide(cfg: Cfg, varName: string): string {
  const t = accessExpr("python", varName, cfg.path);
  return `${t} = ${t} / ${cfg.value}`;
}
