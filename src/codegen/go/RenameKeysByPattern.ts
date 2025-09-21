type Cfg = { pattern: string; replace: string; flags?: string };

export default function RenameKeysByPattern(cfg: Cfg, varName: string): string {
  const pattern = cfg.pattern || "";
  const flags = cfg.flags || "";
  const replace = cfg.replace || "";
  const compile = flags.includes("i") ? `regexp.MustCompile("(?i)${pattern.replace(/"/g, '\\"')}")` : `regexp.MustCompile("${pattern.replace(/"/g, '\\"')}")`;
  return `// RenameKeysByPattern\nre := ${compile}\nvar __rkbp func(v any) any\n__rkbp = func(v any) any {\n  switch t := v.(type) {\n  case []any:\n    out := make([]any, len(t))\n    for i:=range t { out[i] = __rkbp(t[i]) }\n    return out\n  case map[string]any:\n    out := map[string]any{}\n    for k, val := range t { nk := re.ReplaceAllString(k, ${JSON.stringify(replace)}); out[nk] = __rkbp(val) }\n    return out\n  default:\n    return v\n  }\n}\n${varName} = __rkbp(${varName})`;
}
