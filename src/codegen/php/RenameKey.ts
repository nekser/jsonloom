type Cfg = { from: string; to: string };

export default function RenameKey(cfg: Cfg, varName: string): string {
  const from = JSON.stringify(cfg.from || "");
  const to = JSON.stringify(cfg.to || "");
  return `// RenameKey ${from} -> ${to}\n$_rk = function($v) use ($from, $to) {\n  if (is_array($v)) return array_map($_rk, $v);\n  if (is_object($v)) {\n    $out = [];\n    foreach (get_object_vars($v) as $k => $val) {\n      $nk = ($k === ${from}) ? ${to} : $k;\n      $out[$nk] = $_rk($val);\n    }\n    return $out;\n  }\n  return $v;\n};\n${varName} = $_rk(${varName});`;
}
