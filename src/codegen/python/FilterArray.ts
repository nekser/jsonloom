import { accessExpr } from "../utils/pathResolution";

type Cfg = { path: string; key?: string; operator: string; value: unknown; mode?: "keep" | "remove" };

export default function FilterArray(cfg: Cfg, varName: string): string {
  const arr = accessExpr("python", varName, cfg.path);
  const key = cfg.key ? `[${JSON.stringify(cfg.key)}]` : "";
  const op = mapPyOp(cfg.operator);
  const rhs = toPy(cfg.value as unknown);
  const cond = cfg.operator === "contains"
    ? `str(item${key}).find(${rhs}) != -1`
    : cfg.operator === "in"
    ? `${rhs}.count(item${key}) > 0`
    : `item${key} ${op} ${rhs}`;
  const expr = cfg.mode === "remove" ? `[item for item in ${arr} if not (${cond})]` : `[item for item in ${arr} if ${cond}]`;
  return `${arr} = ${expr}`;
}

function mapPyOp(o: string): string { return o === "eq" ? "==" : o === "neq" ? "!=" : o; }
function toPy(v: unknown): string {
  if (v === null || v === undefined) return "None";
  const t = typeof v;
  if (t === "boolean") return (v as boolean) ? "True" : "False";
  if (t === "number") return String(v);
  if (t === "string") return JSON.stringify(v as string);
  if (Array.isArray(v as unknown[])) return `[${(v as unknown[]).map(toPy).join(', ')}]`;
  const entries = Object.entries(v as Record<string, unknown>).map(([k,val])=> `${JSON.stringify(k)}: ${toPy(val)}`);
  return `{${entries.join(', ')}}`;
}
