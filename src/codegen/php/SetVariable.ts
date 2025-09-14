import type { Operation } from "../../operations/types";

type Cfg = { name: string; op: Operation };

export default function SetVariable(cfg: Cfg, _varName: string): string {
  const name = JSON.stringify(cfg.name || "");
  const op = cfg.op;
  const nested = genNested("php", op, "$__JT_ROOT");
  return `// SetVariable\nif (!isset($GLOBALS['__JT_VARS'])) { $GLOBALS['__JT_VARS'] = []; }\n$__JT_ROOT = $data;\n${nested}\n$GLOBALS['__JT_VARS'][${name}] = $__JT_ROOT;`;
}

function genNested(lang: "javascript"|"python"|"php", op: Operation, curVar: string): string {
  // @ts-expect-error runtime injected
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `// TODO: ${op.type}`;
}
