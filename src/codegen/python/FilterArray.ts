import type { JSONValue } from "../../types/json";
import { accessExpr } from "../utils/pathResolution";

type Cfg = { path: string; key?: string; operator: string; value: JSONValue; mode?: "keep" | "remove" };

export default function FilterArray(cfg: Cfg, varName: string): string {
  const arr = accessExpr("python", varName, cfg.path);
  const key = cfg.key ? `[${JSON.stringify(cfg.key)}]` : "";
  const op = mapPyOp(cfg.operator);
  const cond = cfg.operator === "contains"
    ? `str(item${key}).find(${toPy(cfg.value)}) != -1`
    : cfg.operator === "in"
    ? `${toPy(cfg.value)}.count(item${key}) > 0`
    : `item${key} ${op} ${toPy(cfg.value)}`;
  const expr = cfg.mode === "remove" ? `[item for item in ${arr} if not (${cond})]` : `[item for item in ${arr} if ${cond}]`;
  return `${arr} = ${expr}`;
}

function mapPyOp(o: string): string { return o === "eq" ? "==" : o === "neq" ? "!=" : o; }
function toPy(v: JSONValue): string {
  if (v === null) return "None";
  if (typeof v === "boolean") return v ? "True" : "False";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(toPy).join(", ")}]`;
  const items = Object.entries(v as Record<string, JSONValue>).map(([k, val]) => `${JSON.stringify(k)}: ${toPy(val)}`);
  return `{${items.join(", ")}}`;
}
