type Cfg = { mode: "camel" | "snake" | "kebab" | "pascal" };

export default function NormalizeKeyCase(cfg: Cfg, varName: string): string {
  const mode = JSON.stringify(cfg.mode || "camel");
  return `// NormalizeKeyCase (${cfg.mode})\nvar __toCase = func(s, mode string) string {\n  // simple split on non-alnum and camel to snake
  tmp := ""
  for i, r := range s { if i>0 && r>='A' && r<='Z' { tmp += "_" }; tmp += string(r) }
  parts := []string{}
  cur := ""
  for _, r := range tmp { if (r>='A' && r<='Z') || (r>='a'&&r<='z') || (r>='0'&&r<='9') { cur += strings.ToLower(string(r)) } else { if cur!="" { parts = append(parts, cur); cur="" } } }
  if cur!="" { parts = append(parts, cur) }
  switch mode {\n  case "camel":
    out := ""; for i, p := range parts { if i==0 { out += p } else { out += strings.ToUpper(p[:1]) + p[1:] } }; return out
  case "snake": return strings.Join(parts, "_")
  case "kebab": return strings.Join(parts, "-")
  case "pascal":
    out := ""; for _, p := range parts { out += strings.ToUpper(p[:1]) + p[1:] }; return out
  }
  return s
}
var __nkc func(v any) any
__nkc = func(v any) any { switch t := v.(type) {
case []any:
  out := make([]any, len(t)); for i, it := range t { out[i] = __nkc(it) }; return out
case map[string]any:
  out := map[string]any{}; for k, val := range t { out[__toCase(k, ${mode})] = __nkc(val) }; return out
default:
  return v
}}
${varName} = __nkc(${varName})`;
}
