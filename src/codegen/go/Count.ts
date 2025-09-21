type Cfg = { path: string };
export default function Count(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  return `// Count ${JSON.stringify(cfg.path)}\nif arr, ok := getPath(${varName}, ${p}).([]any); ok { setPath(&${varName}, ${p}, float64(len(arr))) } else { setPath(&${varName}, ${p}, float64(0)) }`;
}
