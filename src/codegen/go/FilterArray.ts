import type { JSONValue } from "../../types/json";
import { literal, mapOperator } from "../utils/helpers";
import { accessExpr } from "../utils/pathResolution";

type Cfg = { path: string; key?: string; operator: string; value?: JSONValue; mode?: "keep" | "remove" };

export default function FilterArray(cfg: Cfg, varName: string): string {
  const arr = accessExpr("go", varName, cfg.path);
  const key = cfg.key ?? "";
  const hasKey = key.length > 0;
  const op = cfg.operator || "eq";
  const val = cfg.value ?? null;
  // We'll support eq, neq, gt, gte, lt, lte, contains, in
  // Dynamic JSON: we coerce to string/float64 when needed
  const cond = (() => {
    switch (op) {
      case "contains":
        return hasKey
          ? `func(it any) bool { m, ok := it.(map[string]any); if !ok { return false }; v, _ := m[${JSON.stringify(
              key
            )}].(string); return strings.Contains(v, ${literal("go", val as JSONValue)}) }`
          : `func(it any) bool { s, _ := it.(string); return strings.Contains(s, ${literal("go", val as JSONValue)}) }`;
      case "in":
        // value in [array]
        return hasKey
          ? `func(it any) bool { m, ok := it.(map[string]any); if !ok { return false }; v := m[${JSON.stringify(
              key
            )}]; arr, ok := (${literal("go", val as JSONValue)}).([]any); if !ok { return false }; for _, e := range arr { if fmt.Sprintf("%v", e) == fmt.Sprintf("%v", v) { return true } } return false }`
          : `func(it any) bool { arr, ok := (${literal(
              "go",
              val as JSONValue
            )}).([]any); if !ok { return false }; for _, e := range arr { if fmt.Sprintf("%v", e) == fmt.Sprintf("%v", it) { return true } } return false }`;
      case "gt":
      case "gte":
      case "lt":
      case "lte":
      case "eq":
      case "neq": {
        const cmp = mapOperator("go", op);
        return hasKey
          ? `func(it any) bool { m, ok := it.(map[string]any); if !ok { return false }; 
              if lv, ok := m[${JSON.stringify(
                key
              )}].(float64); ok { if rv, ok := (${literal(
                "go",
                val as JSONValue
              )}).(float64); ok { return lv ${cmp} rv } } 
              return fmt.Sprintf("%v", m[${JSON.stringify(key)}]) ${cmp} fmt.Sprintf("%v", ${literal(
                "go",
                val as JSONValue
              )}) }`
          : `func(it any) bool { if lv, ok := it.(float64); ok { if rv, ok := (${literal(
              "go",
              val as JSONValue
            )}).(float64); ok { return lv ${cmp} rv } }; return fmt.Sprintf("%v", it) ${cmp} fmt.Sprintf("%v", ${literal(
              "go",
              val as JSONValue
            )}) }`;
      }
      default:
        return `func(_ any) bool { return true }`;
    }
  })();

  // Emit filter loop using temporary slice
  return `// FilterArray ${JSON.stringify(cfg.path)}
if arr, ok := ${arr}.([]any); ok {
  out := make([]any, 0, len(arr))
  pred := ${cond}
  for _, it := range arr {
    keep := pred(it)
    if ${cfg.mode === "remove" ? "!keep" : "keep"} { out = append(out, it) }
  }
  ${arr} = out
}`;
}
