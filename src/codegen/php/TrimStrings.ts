type Cfg = { paths?: string[] };
import { accessExpr } from "../utils/pathResolution";

export default function TrimStrings(cfg: Cfg, varName: string): string {
  const fn = `$_ts = function($v) {\n  if (is_string($v)) return trim($v);\n  if (is_array($v)) return array_map($_ts, $v);\n  if (is_object($v)) {\n    $out = [];\n    foreach (get_object_vars($v) as $k => $val) { $out[$k] = $_ts($val); }\n    return $out;\n  }\n  return $v;\n};`;
  if (!cfg.paths || cfg.paths.length === 0) {
    return `// TrimStrings globally\n${fn}\n${varName} = $_ts(${varName});`;
  }
  const lines = cfg.paths.map((p) => {
    const t = accessExpr("php", varName, p);
    return `${t} = $_ts(${t});`;
  });
  return `// TrimStrings at paths\n${fn}\n${lines.join("\n")}`;
}
