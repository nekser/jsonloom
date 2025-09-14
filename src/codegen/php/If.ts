import type { Operation } from "../../operations/types";
import { accessExpr } from "../utils/pathResolution";

type When = { path: string; op: "exists"|"eq"|"neq"|"gt"|"lt"|"gte"|"lte"|"in"|"contains"; value?: string | number | boolean | null | Record<string, unknown> | Array<unknown> };
type Cfg = { when: When; then: Operation[]; else?: Operation[] };

export default function If(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.when.path || "");
  const val = toPhp(cfg.when.value as unknown);
  const cond = buildCond(cfg.when.op, t, val);
  const thenBody = (cfg.then || []).map(op => genNested("php", op, varName)).join("\n\n");
  const elseBody = (cfg.else || []).map(op => genNested("php", op, varName)).join("\n\n");
  return `// If\nif (${cond}) {\n${thenBody}\n}${cfg.else && cfg.else.length ? ` else {\n${elseBody}\n}` : ''}`;
}

function buildCond(op: When["op"], l: string, r: string): string {
  if (op === "exists") return `(isset(${l}))`;
  if (op === "eq") return `(${l} === ${r})`;
  if (op === "neq") return `(${l} !== ${r})`;
  if (op === "gt") return `(${l} > ${r})`;
  if (op === "lt") return `(${l} < ${r})`;
  if (op === "gte") return `(${l} >= ${r})`;
  if (op === "lte") return `(${l} <= ${r})`;
  if (op === "contains") return `(is_string(${l}) && strpos(strval(${l}), strval(${r})) !== false)`;
  if (op === "in") return `in_array(${l}, ${r}, true)`;
  return `false`;
}

function genNested(lang: "javascript"|"python"|"php", op: Operation, curVar: string): string {
  // @ts-expect-error runtime injected
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `// TODO: ${op.type}`;
}

function toPhp(v: unknown): string {
  if (v === null || v === undefined) return "null";
  switch (typeof v) {
    case "boolean": return v ? "true" : "false";
    case "number": return String(v);
    case "string": return JSON.stringify(v);
    default: {
      if (Array.isArray(v)) return `[${v.map(toPhp).join(', ')}]`;
      const entries = Object.entries(v as Record<string, unknown>).map(([k,val])=> `${JSON.stringify(k)} => ${toPhp(val)}`);
      return `[${entries.join(', ')}]`;
    }
  }
}
