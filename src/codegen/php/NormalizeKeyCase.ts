type Cfg = { mode: "camel" | "snake" | "kebab" | "pascal" };

export default function NormalizeKeyCase(cfg: Cfg, varName: string): string {
  const mode = JSON.stringify(cfg.mode || "camel");
  return `// NormalizeKeyCase (${cfg.mode})\n$mode = ${mode};\n$_nkc_to = function($s, $mode) {\n  $s = preg_replace('/([a-z0-9])([A-Z])/', '$1_$2', $s);\n  $parts = preg_split('/[^A-Za-z0-9]+/', strtolower($s), -1, PREG_SPLIT_NO_EMPTY);\n  if ($mode === 'camel') {\n    $out = '';\n    foreach ($parts as $i => $p) { $out .= $i ? ucfirst($p) : $p; }\n    return $out;\n  } elseif ($mode === 'snake') { return implode('_', $parts); }\n  elseif ($mode === 'kebab') { return implode('-', $parts); }\n  else { return implode('', array_map('ucfirst', $parts)); }\n};\n$_nkc = function($v) use ($mode, &$_nkc, $_nkc_to) {\n  if (is_array($v)) {\n    $out = [];\n    foreach ($v as $k => $val) { $out[$k] = $_nkc($val); }\n    return $out;\n  }\n  if (is_object($v)) {\n    $out = [];\n    foreach (get_object_vars($v) as $k => $val) { $out[$_nkc_to($k, $mode)] = $_nkc($val); }\n    return $out;\n  }\n  return $v;\n};\n${varName} = $_nkc(${varName});`;
}
