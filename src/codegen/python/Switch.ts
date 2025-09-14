import type { Operation } from "../../operations/types";
import { accessExpr } from "../utils/pathResolution";
type Case = { value: string; ops: Operation[] };
type Cfg = { path: string; cases: Case[]; default?: Operation[] };

export default function Switch(cfg: Cfg, varName: string): string {
  const expr = accessExpr("python", varName, cfg.path || "");
  const parts: string[] = [];
  (cfg.cases || []).forEach((c, i) => {
    const header = i === 0 ? `if str(${expr}) == ${JSON.stringify(c.value)}:` : `elif str(${expr}) == ${JSON.stringify(c.value)}:`;
    const body = (c.ops || []).map((op) => genNested("python", op, varName)).join("\n\n");
    parts.push(`${header}\n${indent(body)}`);
  });
  if (cfg.default && cfg.default.length) {
    const def = cfg.default.map((op) => genNested("python", op, varName)).join("\n\n");
    parts.push(`else:\n${indent(def)}`);
  }
  return `# Switch\n${parts.join('\n')}`;
}

function genNested(lang: "javascript"|"python"|"php", op: Operation, curVar: string): string {
  // @ts-expect-error injected at runtime
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `# TODO: ${op.type}`;
}

function indent(s: string, n = 2): string { return s.split('\n').map(line => ' '.repeat(n) + line).join('\n'); }
