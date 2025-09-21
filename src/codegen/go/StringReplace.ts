type Cfg = { path?: string; search: string; replace: string };

export default function StringReplace(cfg: Cfg, varName: string): string {
  const search = JSON.stringify(cfg.search ?? "");
  const replace = JSON.stringify(cfg.replace ?? "");
  const body = `__sr := func(v any) any {
  switch t := v.(type) {
  case string:
    return strings.ReplaceAll(t, ${search}, ${replace})
  case []any:
    out := make([]any, len(t))
    for i, it := range t { out[i] = __sr(it) }
    return out
  case map[string]any:
    out := map[string]any{}
    for k, val := range t { out[k] = __sr(val) }
    return out
  default:
    return v
  }
}`;
  if (!cfg.path) {
    return `// StringReplace globally\n${body}\n${varName} = __sr(${varName})`;
  }
  return `// StringReplace at path ${JSON.stringify(cfg.path)}\n${body}\n{
  __t := getPath(${varName}, ${JSON.stringify(cfg.path)})
  setPath(&${varName}, ${JSON.stringify(cfg.path)}, __sr(__t))
}`;
}
