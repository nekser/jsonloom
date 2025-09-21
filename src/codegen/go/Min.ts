type Cfg = { path: string };
export default function Min(cfg: Cfg, varName: string): string {
  return `// Min ${JSON.stringify(cfg.path)}\nif arr, ok := getPath(${varName}, ${JSON.stringify(cfg.path)}).([]any); ok {\n  found := false\n  min := float64(0)\n  for _, v := range arr { if n, ok := v.(float64); ok { if !found || n < min { min = n; found = true } } }\n  if found { setPath(&${varName}, ${JSON.stringify(cfg.path)}, min) } else { setPath(&${varName}, ${JSON.stringify(cfg.path)}, nil) }\n}`;
}
