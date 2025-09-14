type Cfg = { path: string; template: string; onMissing?: "ignore" | "literal" | "error" };

export default function TemplateInterpolate(cfg: Cfg, varName: string): string {
  const access = (cfg.path || "").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const tmpl = JSON.stringify(cfg.template || "");
  const onMissing = cfg.onMissing || 'literal';
  return `// TemplateInterpolate\n$_ti_read = function($root, $path) {\n  $segs = explode('.', $path); $acc = ${varName};\n  foreach ($segs as $seg) { if ($acc === null) return null; if (is_array($acc) || is_object($acc)) { $acc = is_array($acc) ? ($acc[$seg] ?? null) : (get_object_vars($acc)[$seg] ?? null); } else { return null; } }\n  return $acc;\n};\n$_ti = function($tpl) use ($_ti_read) {\n  return preg_replace_callback('/\\$\\{([^}]+)\\}/', function($m) { $p = trim($m[1]); $v = $_ti_read(${varName}, $p); if ($v === null) { if (${JSON.stringify(onMissing)} === 'ignore') return ''; if (${JSON.stringify(onMissing)} === 'error') { throw new Exception('Missing placeholder: '.$p); } return '$' . '{' . $p . '}'; } return strval($v); }, $tpl);\n};\n${varName}${access} = $_ti(${tmpl});`;
}
