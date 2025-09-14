type Cfg = { path: string; delimiter?: string };
import { accessExpr } from "../utils/pathResolution";

export default function UnflattenObject(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const helper = `$delim = ${JSON.stringify(cfg.delimiter ?? ".")};\n$_setPath = function(&$arr, $keys, $value) {\n  $ref = &$arr;\n  foreach ($keys as $k) { if ($k === '') continue; if (!isset($ref[$k]) || !is_array($ref[$k])) $ref[$k] = []; $ref = &$ref[$k]; }\n  $ref = $value;\n};`;
  return `${helper}\n$_out = [];\nforeach ((array)${t} as $flatK => $v) { $_keys = explode($delim, strval($flatK)); $_setPath($_out, $_keys, $v); }\n${t} = $_out;`;
}
