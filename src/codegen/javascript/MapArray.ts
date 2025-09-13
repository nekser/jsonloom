import type { Operation } from "../../operations/types";
import { accessExpr, assignExpr } from "../utils/pathResolution";

type Cfg = { path: string; operations?: Operation[] };

export default function MapArray(cfg: Cfg, varName: string): string {
  const target = accessExpr("javascript", varName, cfg.path);
  const itemVar = "item";
  // We assume a global dispatcher injects nested code via placeholder hook
  const nested = (cfg.operations ?? []).map((op) => `// ${op.type} (nested)\n${generateNested("javascript", op, itemVar)}`).join("\n\n");
  return `${target} = ${target}.map(${itemVar} => {\n${nested ? nested + "\n" : ""}  return ${itemVar};\n})`;
}

function generateNested(lang: "javascript" | "python" | "php", op: Operation, curVar: string): string {
  // The central generator will patch this placeholder at runtime. Fallback TODO.
  // @ts-expect-error injected later
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `// TODO: ${op.type} not yet supported in nested context`;
}
