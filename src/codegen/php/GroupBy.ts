type Cfg = { path: string; by: string; collect?: "array"|"count"|"sum"; sumPath?: string };
import { accessExpr } from "../utils/pathResolution";

export default function GroupBy(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const by = JSON.stringify(cfg.by);
  const collect = cfg.collect ?? "array";
  const sumPath = cfg.sumPath ? JSON.stringify(cfg.sumPath) : undefined;
  const helper = `$_group = function($arr, $by) {\n  $g = [];\n  foreach ((array)$arr as $it) { $k = is_array($it) && isset($it[$by]) ? $it[$by] : null; $g[strval($k)][] = $it; }\n  return $g;\n};`;
  let agg: string;
  if (collect === "count") {
    agg = `$_out = []; foreach ($_groups as $k => $items) { $_out[$k] = count($items); }`;
  } else if (collect === "sum") {
    const sp = sumPath ? sumPath : JSON.stringify("");
    agg = `$_out = []; foreach ($_groups as $k => $items) { $s = 0; foreach ($items as $it) { $s += isset($it[${sp}]) ? (is_numeric($it[${sp}]) ? 0 + $it[${sp}] : 0) : 0; } $_out[$k] = $s; }`;
  } else {
    agg = `$_out = $_groups;`;
  }
  return `${helper}\n$_groups = $_group((array)${t}, ${by});\n${agg}\n${t} = $_out;`;
}
