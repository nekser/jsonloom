import type { Operation } from "../../operations/types";
import { accessExpr } from "../utils/pathResolution";

type Case = { value: string; ops: Operation[] };
type Cfg = { path: string; cases: Case[]; default?: Operation[] };

export default function SwitchOp(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path || "");
  const lines: string[] = [];
  let first = true;
  for (const c of cfg.cases || []) {
    const cond = `strval(${t}) === ${JSON.stringify(c.value)}`;
    const body = (c.ops || []).map(op => genNested("php", op, varName)).join("\n\n");
    lines.push(`${first ? 'if' : 'elseif'} (${cond}) {\n${body}\n}`);
    first = false;
  }
  if (cfg.default && cfg.default.length) {
    const body = cfg.default.map(op => genNested("php", op, varName)).join("\n\n");
    lines.push(`else {\n${body}\n}`);
  }
  return `// Switch\n${lines.join(' ')}\n`;
}

function genNested(lang: "javascript"|"python"|"php", op: Operation, curVar: string): string {
  // @ts-expect-error runtime injected
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `// TODO: ${op.type}`;
}
