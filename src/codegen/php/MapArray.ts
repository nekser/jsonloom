import type { Operation } from "../../operations/types";
import { accessExpr } from "../utils/pathResolution";

type Cfg = { path: string; operations?: Operation[] };

export default function MapArray(cfg: Cfg, varName: string): string {
  const target = accessExpr("php", varName, cfg.path);
  const itemVar = "$order"; // keep parity with JS
  const nested = (cfg.operations ?? [])
    .map((op) => `// ${op.type} (nested)\n${generateNested("php", op, itemVar)}`)
    .join("\n\n");
  return `${target} = array_map(function(${itemVar}) {\n${nested ? nested + "\n" : ""}  return ${itemVar};\n}, ${target});`;
}

function generateNested(lang: "javascript" | "python" | "php", op: Operation, curVar: string): string {
  // @ts-expect-error injected by central generator at runtime
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `// TODO: ${op.type} not yet supported`;
}
