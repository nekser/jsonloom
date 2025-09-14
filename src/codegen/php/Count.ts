type Cfg = { path: string };
import { accessExpr } from "../utils/pathResolution";
export default function Count(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  return `${t} = is_array(${t}) ? count(${t}) : 0;`;
}
