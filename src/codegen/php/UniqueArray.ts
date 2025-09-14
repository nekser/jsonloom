type Cfg = { path: string };
import { accessExpr } from "../utils/pathResolution";

export default function UniqueArray(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  return `${t} = array_values(array_unique(is_array(${t}) ? ${t} : []));`;
}
