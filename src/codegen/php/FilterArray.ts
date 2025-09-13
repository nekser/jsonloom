import type { JSONValue } from "../../types/json";
import { accessExpr } from "../utils/pathResolution";

type Cfg = { path: string; key?: string; operator: string; value: JSONValue; mode?: "keep" | "remove" };

export default function FilterArray(cfg: Cfg, varName: string): string {
  const arr = accessExpr("php", varName, cfg.path);
  const key = cfg.key ? `[${JSON.stringify(cfg.key)}]` : "";
  const cmp = phpCmp(cfg.operator, `$_item${key}`, toPhp(cfg.value));
  const keep = cfg.mode === "remove" ? `!(${cmp})` : cmp;
  return `${arr} = array_values(array_filter(${arr}, fn($_item) => ${keep}));`;
}

function phpCmp(op: string, left: string, right: string): string {
  switch (op) {
    case "eq": return `${left} === ${right}`;
    case "neq": return `${left} !== ${right}`;
    case "gt": return `${left} > ${right}`;
    case "lt": return `${left} < ${right}`;
    case "gte": return `${left} >= ${right}`;
    case "lte": return `${left} <= ${right}`;
    case "contains": return `strpos(strval(${left}), ${right}) !== false`;
    case "in": return `in_array(${left}, ${right}, true)`;
    default: return `${left} == ${right}`;
  }
}

function toPhp(v: JSONValue): string {
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return `[` + v.map(toPhp).join(", ") + `]`;
  const entries = Object.entries(v as Record<string, JSONValue>).map(([k, val]) => `${JSON.stringify(k)} => ${toPhp(val)}`);
  return `[${entries.join(", ")}]`;
}
