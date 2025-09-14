type Cfg = { path: string; by?: string; op: "sum"|"avg"|"min"|"max"|"concat" };
import { accessExpr } from "../utils/pathResolution";

export default function ReduceArray(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const pick = cfg.by ? `$it[${JSON.stringify(cfg.by)}] ?? null` : `$it`;
  if (cfg.op === "concat") {
    return `${t} = implode('', array_map(function($it){ $v = ${pick}; return isset($v) ? strval($v) : ''; }, (array)${t}));`;
  }
  const mapNums = `array_filter(array_map(function($it){ $v = ${pick}; return is_numeric($v) ? 0 + $v : NAN; }, (array)${t}), function($n){ return is_finite($n); })`;
  switch (cfg.op) {
    case "sum": return `${t} = array_sum(${mapNums});`;
    case "avg": return `${t} = ($__arr = ${mapNums}) ? array_sum($__arr) / count($__arr) : 0;`;
    case "min": return `${t} = ($__arr = ${mapNums}) ? min($__arr) : 0;`;
    case "max": return `${t} = ($__arr = ${mapNums}) ? max($__arr) : 0;`;
  }
}
