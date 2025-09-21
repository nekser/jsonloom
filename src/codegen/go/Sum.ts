type Cfg = { path: string };
export default function Sum(cfg: Cfg, varName: string): string {
  return `// Sum ${JSON.stringify(cfg.path)}\nif arr, ok := getPath(${varName}, ${JSON.stringify(cfg.path)}).([]any); ok {\n  total := float64(0)\n  for _, v := range arr { if n, ok := v.(float64); ok { total += n } }\n  setPath(&${varName}, ${JSON.stringify(cfg.path)}, total)\n} else { setPath(&${varName}, ${JSON.stringify(cfg.path)}, float64(0)) }`;
}
