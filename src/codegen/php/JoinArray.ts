type Cfg = { path: string; delimiter?: string };
import { accessExpr } from "../utils/pathResolution";

export default function JoinArray(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  const d = JSON.stringify(cfg.delimiter ?? ",");
  return `${t} = implode(${d}, array_map(function($v){ return isset($v) ? strval($v) : ""; }, (array)${t}));`;
}
