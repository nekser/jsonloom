import type { Operation } from "../../operations/types";
import { accessExpr } from "../utils/pathResolution";

type Cfg = { path: string; operations?: Operation[] };

export default function MapArray(cfg: Cfg, varName: string): string {
  const target = accessExpr("go", varName, cfg.path);
  const itemVar = "order";
  const nested = (cfg.operations ?? [])
    .map((op) => `// ${op.type} (nested)\n${generateNested("go", op, itemVar)}`)
    .join("\n\n");
  return `// MapArray ${JSON.stringify(cfg.path)}\nif arr, ok := ${target}.([]any); ok {\n  out := make([]any, 0, len(arr))\n  for _, ${itemVar} := range arr {\n${nested ? indent(nested, 4) + "\n" : ""}    out = append(out, ${itemVar})\n  }\n  ${target} = out\n}`;
}

function indent(s: string, n = 2): string {
  const pad = " ".repeat(n);
  return s
    .split("\n")
    .map((l) => (l.length ? pad + l : l))
    .join("\n");
}

function generateNested(lang: "go", op: Operation, curVar: string): string {
  // @ts-expect-error injected by central generator at runtime
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `// TODO: ${op.type} not yet supported`;
}
