type Cfg = { path: string; value: number };
import { accessExpr } from "../utils/pathResolution";
export default function Power(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  return `${t} = pow(${t}, ${cfg.value});`;
}
