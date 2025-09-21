type Cfg = { path: string; to: "string"|"number"|"boolean"|"object"|"array"; fallback?: unknown };

export default function CoerceType(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  const to = cfg.to;
  const fb = cfg.fallback !== undefined ? JSON.stringify(cfg.fallback) : undefined;
  const coerceBody = `__coerce := func(v any, to string) (any, error) {
  switch to {
  case "string":
    return fmt.Sprintf("%v", v), nil
  case "number":
    switch t := v.(type) {
    case float64:
      return t, nil
    case string:
      // no str->num parsing to keep deps minimal; fallback
      return nil, fmt.Errorf("not number")
    case bool:
      if t { return float64(1), nil } else { return float64(0), nil }
    default:
      return nil, fmt.Errorf("not number")
    }
  case "boolean":
    switch t := v.(type) {
    case bool:
      return t, nil
    case float64:
      return t != 0, nil
    case string:
      s := strings.ToLower(strings.TrimSpace(t))
      if s == "true" || s == "1" || s == "yes" || s == "y" { return true, nil }
      if s == "false" || s == "0" || s == "no" || s == "n" { return false, nil }
      return s != "", nil
    default:
      return v != nil, nil
    }
  case "object":
    if m, ok := v.(map[string]any); ok { return m, nil }
    if s, ok := v.(string); ok { var m map[string]any; if err := json.Unmarshal([]byte(s), &m); err==nil { return m, nil } }
    return nil, fmt.Errorf("not object")
  case "array":
    if a, ok := v.([]any); ok { return a, nil }
    if s, ok := v.(string); ok { var a []any; if err := json.Unmarshal([]byte(s), &a); err==nil { return a, nil } }
    return nil, fmt.Errorf("not array")
  }
  return nil, fmt.Errorf("unknown")
}`;
  const tryBlock = fb !== undefined
    ? `{
  __cur := getPath(${varName}, ${p})
  ${coerceBody}
  if __newVal, __err := __coerce(__cur, ${JSON.stringify(to)}); __err == nil { setPath(&${varName}, ${p}, __newVal) } else { setPath(&${varName}, ${p}, ${fb}) }
}`
    : `{
  __cur := getPath(${varName}, ${p})
  ${coerceBody}
  if __newVal, __err := __coerce(__cur, ${JSON.stringify(to)}); __err == nil { setPath(&${varName}, ${p}, __newVal) }
}`;
  return `// CoerceType\n${tryBlock}`;
}
