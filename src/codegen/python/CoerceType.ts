type Cfg = { path: string; to: "string"|"number"|"boolean"|"object"|"array"; fallback?: unknown };
import { accessExpr } from "../utils/pathResolution";

export default function CoerceType(cfg: Cfg, varName: string): string {
  const tgt = accessExpr("python", varName, cfg.path);
  const fb = cfg.fallback !== undefined ? JSON.stringify(cfg.fallback) : "None";
  const to = cfg.to;
  let expr: string;
  if (to === "string") expr = `str(${tgt}) if ${tgt} is not None else ${fb}`;
  else if (to === "number") expr = `float(${tgt}) if ${tgt} not in (None, '') else ${fb}`;
  else if (to === "boolean") expr = `bool(${tgt}) if ${tgt} is not None else ${fb}`;
  else if (to === "object") expr = `dict(${tgt}) if isinstance(${tgt}, dict) else ${fb}`;
  else expr = `list(${tgt}) if isinstance(${tgt}, (list, tuple)) else ${fb}`; // array
  return `${tgt} = ${expr}`;
}
