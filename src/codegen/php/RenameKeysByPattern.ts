type Cfg = { pattern: string; replace: string; flags?: string };

export default function RenameKeysByPattern(cfg: Cfg, varName: string): string {
  const pattern = `/${cfg.pattern.replace(/[\\/]/g, "\\$&")}/${cfg.flags ?? ""}`;
  const replace = JSON.stringify(cfg.replace || "");
  return `// RenameKeysByPattern\n$pattern = ${JSON.stringify(pattern)}; $replace = ${replace};\n$_rkbp = function($v) use ($pattern, $replace) {\n  if (is_array($v)) return array_map($_rkbp, $v);\n  if (is_object($v)) {\n    $out = [];\n    foreach (get_object_vars($v) as $k => $val) {\n      $nk = preg_replace($pattern, $replace, $k);\n      $out[$nk] = $_rkbp($val);\n    }\n    return $out;\n  }\n  return $v;\n};\n${varName} = $_rkbp(${varName});`;
}
