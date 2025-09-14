type Cfg = { path?: string; pattern: string; replace: string; flags?: string };
import { accessExpr } from "../utils/pathResolution";

export default function RegexReplace(cfg: Cfg, varName: string): string {
  const pattern = `/${cfg.pattern.replace(/[\\/]/g, "\\$&")}/${cfg.flags ?? "g"}`;
  const replace = JSON.stringify(cfg.replace ?? "");
  const fn = `$pattern = ${JSON.stringify(pattern)}; $replace = ${replace};\n$_rr = function($v) use ($pattern, $replace) {\n  if (is_string($v)) return preg_replace($pattern, $replace, $v);\n  if (is_array($v)) return array_map($_rr, $v);\n  if (is_object($v)) {\n    $out = [];\n    foreach (get_object_vars($v) as $k => $val) { $out[$k] = $_rr($val); }\n    return $out;\n  }\n  return $v;\n};`;
  if (!cfg.path) {
    return `// RegexReplace globally\n${fn}\n${varName} = $_rr(${varName});`;
  }
  const t = accessExpr("php", varName, cfg.path);
  return `// RegexReplace at path ${JSON.stringify(cfg.path)}\n${fn}\n${t} = $_rr(${t});`;
}
