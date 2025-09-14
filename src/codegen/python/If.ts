import type { Operation } from "../../operations/types";
import { accessExpr } from "../utils/pathResolution";

type Cfg = { when: { path: string; op: "exists"|"eq"|"neq"|"gt"|"lt"|"gte"|"lte"|"in"|"contains"; value?: unknown }; then: Operation[]; else?: Operation[] };

export default function If(cfg: Cfg, varName: string): string {
  const lhs = accessExpr("python", varName, cfg.when?.path || "");
  const op = cfg.when?.op || "exists";
  const rhs = toPy(cfg.when?.value as unknown);
  const condExpr = buildCond(op, lhs, rhs);
  const thenCode = (cfg.then || []).map((op) => genNested("python", op, varName)).join("\n\n");
  const elseCode = (cfg.else || []).map((op) => genNested("python", op, varName)).join("\n\n");
  const elsePart = elseCode ? `\nelse:\n${indent(elseCode)}` : "";
  return `# If\nif ${condExpr}:\n${indent(thenCode)}${elsePart}`;
}

function buildCond(op: Cfg["when"]["op"], l: string, r: string): string {
  if (op === "exists") return `${l} is not None`;
  if (op === "eq") return `${l} == ${r}`;
  if (op === "neq") return `${l} != ${r}`;
  if (op === "gt") return `${l} > ${r}`;
  if (op === "lt") return `${l} < ${r}`;
  if (op === "gte") return `${l} >= ${r}`;
  if (op === "lte") return `${l} <= ${r}`;
  if (op === "in") return `${l} in ${r}`;
  if (op === "contains") return `${r} in str(${l})`;
  return "False";
}

function genNested(lang: "javascript"|"python"|"php", op: Operation, curVar: string): string {
  // @ts-expect-error runtime injected
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `# TODO: ${op.type}`;
}

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

function indent(s: string, n = 2): string { return s.split('\n').map(line => ' '.repeat(n) + line).join('\n'); }
