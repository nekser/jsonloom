import type { Operation } from "../../operations/types";
type Cfg = { name: string; op: Operation };

export default function SetVariable(cfg: Cfg, varName: string): string {
  const name = (cfg.name || "").trim();
  if (!name) return `# SetVariable skipped: empty name`;
  const nested = cfg.op ? genNested("python", cfg.op, varName) : "";
  return `# SetVariable ${JSON.stringify(name)}\n__JT_VARS = globals().get('__JT_VARS', {})\n${nested}\n__JT_VARS[${JSON.stringify(name)}] = ${varName}\nglobals()['__JT_VARS'] = __JT_VARS`;
}

function genNested(lang: "javascript"|"python"|"php", op: Operation, curVar: string): string {
  // @ts-expect-error runtime injected
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `# TODO: ${op.type}`;
}
