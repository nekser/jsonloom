import type { Operation } from "../../operations/types";
type Cfg = { name: string; op: Operation };

export default function SetVariable(cfg: Cfg, varName: string): string {
  const name = (cfg.name || "").trim();
  if (!name) return `// SetVariable skipped: empty name`;
  // Compute by applying nested op to the ROOT variable snapshot
  const compute = cfg.op ? generateNested("javascript", cfg.op, varName) : "";
  // We store on a reserved object to avoid clobbering user scope
  return `// SetVariable ${JSON.stringify(name)}
// compute variable value
{\n${compute}\n// store as a property for later reference\n(globalThis.__JT_VARS ||= {})[${JSON.stringify(name)}] = ${varName};\n}`;
}

function generateNested(lang: "javascript" | "python" | "php", op: Operation, curVar: string): string {
  // @ts-expect-error injected by central generator at runtime
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `// TODO: ${op.type} not yet supported`;
}
