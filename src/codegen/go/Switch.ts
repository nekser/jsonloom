import type { Operation } from "../../operations/types";
type Case = { value: string; ops: Operation[] };
type Cfg = { path: string; cases: Case[]; default?: Operation[] };

export default function Switch(cfg: Cfg, varName: string): string {
  const path = JSON.stringify(cfg.path || "");
  const blocks = (cfg.cases || []).map((c) => ({
    test: `fmt.Sprintf("%v", getPath(${varName}, ${path})) == ${JSON.stringify(String(c.value))}`,
    body: (c.ops || []).map((op) => generateNested("go", op, varName)).join("\n\n"),
  }));
  const def = (cfg.default || []).map((op) => generateNested("go", op, varName)).join("\n\n");
  const chain = blocks
    .map((b, i) => `${i === 0 ? "if" : "else if"} ${b.test} {\n${b.body}\n}`)
    .join(" ");
  const tail = def ? ` else {\n${def}\n}` : "";
  return `// Switch\n${chain}${tail}`;
}

function generateNested(lang: "go", op: Operation, curVar: string): string {
  // @ts-expect-error injected by central generator at runtime
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `// TODO: ${op.type} not yet supported`;
}
