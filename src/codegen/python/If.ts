import type { Operation } from "../../operations/types";
import { accessExpr } from "../utils/pathResolution";

type Cfg = { when: { path: string; op: string; value?: unknown }; then: Operation[]; else?: Operation[] };

export default function If(cfg: Cfg, varName: string): string {
  const lhs = accessExpr("javascript", varName, cfg.when?.path || "");
  const op = cfg.when?.op || "exists";
  const rhsLit = JSON.stringify(cfg.when?.value);
  const condExpr = (() => {
    switch (op) {
      case "exists":
        return `${lhs} !== undefined && ${lhs} !== null`;
      case "eq":
        return `(${lhs}) === ${rhsLit}`;
      case "neq":
        return `(${lhs}) !== ${rhsLit}`;
      case "gt":
        return `(${lhs}) > ${rhsLit}`;
      case "lt":
        return `(${lhs}) < ${rhsLit}`;
      case "gte":
        return `(${lhs}) >= ${rhsLit}`;
      case "lte":
        return `(${lhs}) <= ${rhsLit}`;
      case "in":
        return `Array.isArray(${rhsLit}) ? ${rhsLit}.includes(${lhs}) : false`;
      case "contains":
        return `(Array.isArray(${lhs}) ? ${lhs}.includes(${rhsLit}) : String(${lhs}).includes(String(${rhsLit})))`;
      default:
        return `${lhs}`; // truthy
    }
  })();
  const thenCode = (cfg.then || []).map((op) => generateNested("javascript", op, varName)).join("\n\n");
  const elseCode = (cfg.else || []).map((op) => generateNested("javascript", op, varName)).join("\n\n");
  const elsePart = elseCode ? ` else {\n${elseCode}\n}` : "";
  return `// If
if (${condExpr}) {\n${thenCode}\n}${elsePart}`;
}

function generateNested(lang: "javascript" | "python" | "php", op: Operation, curVar: string): string {
  // @ts-expect-error injected by central generator at runtime
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `// TODO: ${op.type} not yet supported`;
}
