type Cfg = { path: string; source: "root"|"path"; sourcePath?: string; strategy?: "shallow"|"deep"|"overwrite" };
import { accessExpr } from "../utils/pathResolution";

export default function MergeAtPath(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const src = cfg.source === "root" ? `$${varName}` : accessExpr("php", varName, cfg.sourcePath || "");
  const strat = cfg.strategy ?? "shallow";
  if (strat === "overwrite") return `${t} = (array)${src};`;
  if (strat === "shallow") return `${t} = array_merge((array)${t}, (array)${src});`;
  // deep merge
  const helper = `$_deep = function($a, $b) use (&$_deep) {\n  foreach ((array)$b as $k => $v) {\n    if (isset($a[$k]) && is_array($a[$k]) && is_array($v)) { $a[$k] = $_deep($a[$k], $v); } else { $a[$k] = $v; }\n  }\n  return $a;\n};`;
  return `${helper}\n${t} = $_deep((array)${t}, (array)${src});`;
}
