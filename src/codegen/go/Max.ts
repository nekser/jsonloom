type Cfg = { path: string };
export default function Max(cfg: Cfg, varName: string): string {
  return `// Max ${JSON.stringify(cfg.path)}\nif arr, ok := getPath(${varName}, ${JSON.stringify(cfg.path)}).([]any); ok {\n  found := false\n  max := float64(0)\n  for _, v := range arr { if n, ok := v.(float64); ok { if !found || n > max { max = n; found = true } } }\n  if found { setPath(&${varName}, ${JSON.stringify(cfg.path)}, max) } else { setPath(&${varName}, ${JSON.stringify(cfg.path)}, nil) }\n}`;
}
