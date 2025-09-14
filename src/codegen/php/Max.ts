type Cfg = { path: string };
import { accessExpr } from "../utils/pathResolution";
export default function Max(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  return `${t} = (is_array(${t}) && count(${t}) > 0) ? max(${t}) : null;`;
}
