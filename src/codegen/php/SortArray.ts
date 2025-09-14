type Cfg = { path: string; by?: string; order?: "asc" | "desc" };
import { accessExpr } from "../utils/pathResolution";

export default function SortArray(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const dir = cfg.order === "desc" ? -1 : 1;
  if (!cfg.by) {
    return `${t} = (is_array(${t}) ? ((${dir} === 1) ? sort(${t}) : rsort(${t})) : ${t});`;
  }
  const key = JSON.stringify(cfg.by);
  return `${t} = array_values((array)${t});
usort(${t}, function($a, $b) { $va = $a[${key}] ?? null; $vb = $b[${key}] ?? null; if ($va == $vb) return 0; return ($va < $vb ? -1 : 1) * ${dir}; });`;
}
