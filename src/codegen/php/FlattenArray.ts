type Cfg = { path: string; depth?: number };
import { accessExpr } from "../utils/pathResolution";

export default function FlattenArray(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const depth = cfg.depth ?? 1;
  const helper = `$_flat = function($arr, $depth) use (&$_flat) {\n  $out = [];\n  foreach ($arr as $v) {\n    if ($depth > 0 && is_array($v)) {\n      $out = array_merge($out, $_flat($v, $depth - 1));\n    } else {\n      $out[] = $v;\n    }\n  }\n  return $out;\n};`;
  return `${helper}\n${t} = $_flat(is_array(${t}) ? ${t} : [], ${depth});`;
}
