type Cfg = { path: string; delimiter?: string; maxDepth?: number };
import { accessExpr } from "../utils/pathResolution";

export default function FlattenObject(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const helper = `$delim = ${JSON.stringify(cfg.delimiter ?? ".")}; $depth = ${cfg.maxDepth ?? -1};\n$_flatObj = function($obj, $prefix = '', $d = 0) use (&$_flatObj, $delim, $depth) {\n  $out = [];\n  foreach ((array)$obj as $k => $v) {\n    $nk = $prefix !== '' ? $prefix.$delim.$k : $k;\n    if (($depth < 0 || $d < $depth) && (is_array($v) || is_object($v))) {\n      $out = $out + $_flatObj($v, $nk, $d+1);\n    } else {\n      $out[$nk] = $v;\n    }\n  }\n  return $out;\n};`;
  return `${helper}\n${t} = $_flatObj(${t});`;
}
