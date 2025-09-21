import type { Operation } from "../../operations/types";

type Cfg = { when: { path: string; op: string; value?: unknown }; then: Operation[]; else?: Operation[] };

export default function If(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.when?.path || "");
  const op = cfg.when?.op || "exists";
  const rhs = JSON.stringify(cfg.when?.value);
  const cond = (() => {
    switch (op) {
      case "exists":
        return `(__v := getPath(${varName}, ${p}); __v != nil)`;
      case "eq":
      case "neq":
      case "gt":
      case "lt":
      case "gte":
      case "lte": {
        const cmp = op === "eq" ? "==" : op === "neq" ? "!=" : op;
        return `func() bool { v := getPath(${varName}, ${p}); if lv, ok := v.(float64); ok { if rv, ok := (${rhs}).(float64); ok { return lv ${cmp} rv } } return fmt.Sprintf("%v", v) ${cmp} fmt.Sprintf("%v", ${rhs}) }()`;
      }
      case "in":
        return `func() bool { v := getPath(${varName}, ${p}); if arr, ok := (${rhs}).([]any); ok { for _, e := range arr { if fmt.Sprintf("%v", e) == fmt.Sprintf("%v", v) { return true } } } return false }()`;
      case "contains":
        return `func() bool { v := getPath(${varName}, ${p}); s := fmt.Sprintf("%v", v); return strings.Contains(s, fmt.Sprintf("%v", ${rhs})) }()`;
      default:
        return `getPath(${varName}, ${p}) != nil`;
    }
  })();
  const thenCode = (cfg.then || []).map((op) => generateNested("go", op, varName)).join("\n\n");
  const elseCode = (cfg.else || []).map((op) => generateNested("go", op, varName)).join("\n\n");
  const elsePart = elseCode ? ` else {\n${elseCode}\n}` : "";
  return `// If\nif ${cond} {\n${thenCode}\n}${elsePart}`;
}

function generateNested(lang: "go", op: Operation, curVar: string): string {
  // @ts-expect-error injected by central generator at runtime
  if (typeof globalThis.__codegen_generateOp === "function") return globalThis.__codegen_generateOp(lang, op, curVar);
  return `// TODO: ${op.type} not yet supported`;
}
