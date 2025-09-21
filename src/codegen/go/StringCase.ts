type Cfg = { path: string; mode: "lowercase" | "uppercase"; coerceNonString?: boolean };

export default function StringCase(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  const upper = cfg.mode === "uppercase";
  const coerce = !!cfg.coerceNonString;
  return `// StringCase (${cfg.mode})\nvar __sc_apply = func(s string) string { if ${upper ? "true" : "false"} { return strings.ToUpper(s) } else { return strings.ToLower(s) } }\nvar __sc_map func(v any) any\n__sc_map = func(v any) any {\n  switch t := v.(type) {\n  case string:\n    return __sc_apply(t)\n  case []any:\n    out := make([]any, len(t))\n    for i:=range t { out[i] = __sc_map(t[i]) }\n    return out\n  case map[string]any:\n    out := map[string]any{}\n    for k, val := range t { out[k] = __sc_map(val) }\n    return out\n  default:\n    if ${coerce ? "true" : "false"} { return __sc_apply(fmt.Sprintf("%v", v)) }\n    return v\n  }\n}\nsetPath(&${varName}, ${p}, __sc_map(getPath(${varName}, ${p})))`;
}
