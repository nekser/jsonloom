import type { Operation } from "../../src/operations/types";
import { accessExpr } from "../utils/pathResolution";

type Cfg = { path: string; operations?: Operation[] };

export default function MapArray(cfg: Cfg, varName: string): string {
  const target = accessExpr("javascript", varName, cfg.path);
  const itemVar = "order"; // match example semantics
  const nested = (cfg.operations ?? []).map((op) => `// ${op.type} (nested)\n${generateNested("javascript", op, itemVar)}`).join("\n\n");
  return `${target} = ${target}.map(${itemVar} => {\n${nested ? nested + "\n" : ""}  return ${itemVar};\n})`;
}

function generateNested(lang: "javascript" | "python" | "php", op: Operation, curVar: string): string {
  // @ts-expect-error injected by central generator at runtime
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `// TODO: ${op.type} not yet supported`;
}
