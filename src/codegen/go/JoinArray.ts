type Cfg = { path: string; delimiter?: string };
export default function JoinArray(cfg: Cfg, varName: string): string {
  const delim = JSON.stringify(cfg.delimiter ?? ",");
  return `// JoinArray ${JSON.stringify(cfg.path)}\nif arr, ok := getPath(${varName}, ${JSON.stringify(cfg.path)}).([]any); ok {\n  parts := make([]string, 0, len(arr))\n  for _, v := range arr { parts = append(parts, fmt.Sprintf("%v", v)) }\n  setPath(&${varName}, ${JSON.stringify(cfg.path)}, strings.Join(parts, ${delim}))\n}`;
}
