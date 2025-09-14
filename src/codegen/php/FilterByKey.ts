type Cfg = { mode: "keep" | "remove"; keys: string[] };

export default function FilterByKey(cfg: Cfg, varName: string): string {
  const keys = JSON.stringify(cfg.keys || []);
  const keep = cfg.mode === "keep";
  return `// FilterByKey (${keep ? "keep" : "remove"}) keys ${keys}\n$_fbkKeys = array_flip(${keys});\n$_fbk = function($v) use ($_fbkKeys) {\n  if (is_array($v)) return array_map($_fbk, $v);\n  if (is_object($v)) {\n    $out = [];\n    foreach (get_object_vars($v) as $k => $val) {\n      $cond = ${keep} ? array_key_exists($k, $_fbkKeys) : !array_key_exists($k, $_fbkKeys);\n      if ($cond) $out[$k] = $_fbk($val);\n    }\n    return $out;\n  }\n  return $v;\n};\n${varName} = $_fbk(${varName});`;
}
