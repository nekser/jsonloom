type Cfg = { path: string; format: string; timezone?: string };

export default function ParseDate(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  return `// ParseDate (hint ${JSON.stringify(cfg.format)})\nif s, ok := getPath(${varName}, ${p}).(string); ok { if t, err := time.Parse(time.RFC3339, s); err == nil { setPath(&${varName}, ${p}, t.Format(time.RFC3339)) } }`;
}
