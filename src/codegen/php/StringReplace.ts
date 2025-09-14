type Cfg = { path?: string; search: string; replace: string };
import { accessExpr } from "../utils/pathResolution";

export default function StringReplace(cfg: Cfg, varName: string): string {
  const search = JSON.stringify(cfg.search ?? "");
  const replace = JSON.stringify(cfg.replace ?? "");
  const fn = `$search = ${search}; $replace = ${replace};\n$_sr = function($v) use ($search, $replace) {\n  if (is_string($v)) return str_replace($search, $replace, $v);\n  if (is_array($v)) return array_map($_sr, $v);\n  if (is_object($v)) {\n    $out = [];\n    foreach (get_object_vars($v) as $k => $val) { $out[$k] = $_sr($val); }\n    return $out;\n  }\n  return $v;\n};`;
  if (!cfg.path) {
    return `// StringReplace globally\n${fn}\n${varName} = $_sr(${varName});`;
  }
  const t = accessExpr("php", varName, cfg.path);
  return `// StringReplace at path ${JSON.stringify(cfg.path)}\n${fn}\n${t} = $_sr(${t});`;
}
