type Cfg = { path?: string; mode: "upper" | "lower" | "title" };
import { accessExpr } from "../utils/pathResolution";

export default function StringCase(cfg: Cfg, varName: string): string {
  const fn = `$_sc = function($v) use ($mode) {\n  if (is_string($v)) {\n    if ($mode === 'upper') return strtoupper($v);\n    if ($mode === 'lower') return strtolower($v);\n    return ucwords(strtolower($v));\n  }\n  if (is_array($v)) return array_map($_sc, $v);\n  if (is_object($v)) {\n    $out = [];\n    foreach (get_object_vars($v) as $k => $val) { $out[$k] = $_sc($val); }\n    return $out;\n  }\n  return $v;\n};`;
  const modeDecl = `$mode = ${JSON.stringify(cfg.mode)};`;
  if (!cfg.path) {
    return `// StringCase globally\n${modeDecl}\n${fn}\n${varName} = $_sc(${varName});`;
  }
  const t = accessExpr("php", varName, cfg.path);
  return `// StringCase at path ${JSON.stringify(cfg.path)}\n${modeDecl}\n${fn}\n${t} = $_sc(${t});`;
}
