type Cfg = { path: string };
import { accessExpr } from "../utils/pathResolution";
export default function Sum(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  return `${t} = array_sum(is_array(${t}) ? ${t} : []);`;
}
