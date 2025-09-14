import type { Operation } from "../../operations/types";
import { accessExpr } from "../utils/pathResolution";

type Cfg = { path: string; operations?: Operation[] };

export default function MapArray(cfg: Cfg, varName: string): string {
  const target = accessExpr("python", varName, cfg.path);
  const itemVar = "item";
  const nested = (cfg.operations ?? []).map((op) => `# ${op.type} (nested)\n${genNested("python", op, itemVar)}`).join("\n\n");
  const body = nested ? `${nested}\n` : "";
  return `__mapped = []\nfor ${itemVar} in ${target}:\n${indent(body + `__mapped.append(${itemVar})`)}\n${target} = __mapped`;
}

function genNested(lang: "javascript"|"python"|"php", op: Operation, curVar: string): string {
  // @ts-expect-error runtime injected
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `# TODO: ${op.type}`;
}

function indent(s: string, n = 2): string { return s.split('\n').map(line => ' '.repeat(n) + line).join('\n'); }
