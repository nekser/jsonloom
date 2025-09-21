type Cfg = { path?: string; pattern: string; replace: string; flags?: string };

export default function RegexReplace(cfg: Cfg, varName: string): string {
  const pattern = cfg.pattern || "";
  const flags = cfg.flags || ""; // Go's regexp does not use JS flags; 'i' not supported here without (?i)
  const replace = cfg.replace ?? "";
  const compile = flags.includes("i") ? `regexp.MustCompile("(?i)${pattern.replace(/"/g, '\\"')}")` : `regexp.MustCompile("${pattern.replace(/"/g, '\\"')}")`;
  const apply = `func __rr(v any, re *regexp.Regexp, repl string) any {
  switch t := v.(type) {
  case string:
    return re.ReplaceAllString(t, repl)
  case []any:
    out := make([]any, len(t))
    for i:=range t { out[i] = __rr(t[i], re, repl) }
    return out
  case map[string]any:
    out := map[string]any{}
    for k, val := range t { out[k] = __rr(val, re, repl) }
    return out
  default:
    return v
  }
}`;
  if (!cfg.path) {
    return `// RegexReplace globally\nre := ${compile}\n${apply}\n${varName} = __rr(${varName}, re, ${JSON.stringify(replace)})`;
  }
  return `// RegexReplace at path ${JSON.stringify(cfg.path)}\nre := ${compile}\n${apply}\nsetPath(&${varName}, ${JSON.stringify(cfg.path)}, __rr(getPath(${varName}, ${JSON.stringify(cfg.path)}), re, ${JSON.stringify(replace)}))`;
}
