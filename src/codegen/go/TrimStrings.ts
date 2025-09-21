type Cfg = { path?: string };

export default function TrimStrings(cfg: Cfg, varName: string): string {
  const apply = `var __ts func(v any) any\n__ts = func(v any) any {\n  switch t := v.(type) {\n  case string:\n    return strings.TrimSpace(t)\n  case []any:\n    out := make([]any, len(t))\n    for i:=range t { out[i] = __ts(t[i]) }\n    return out\n  case map[string]any:\n    out := map[string]any{}\n    for k, val := range t { out[k] = __ts(val) }\n    return out\n  default:\n    return v\n  }\n}`;
  if (!cfg.path) return `// TrimStrings globally\n${apply}\n${varName} = __ts(${varName})`;
  return `// TrimStrings at path ${JSON.stringify(cfg.path)}\n${apply}\nsetPath(&${varName}, ${JSON.stringify(cfg.path || "")}, __ts(getPath(${varName}, ${JSON.stringify(cfg.path || "")})))`;
}
