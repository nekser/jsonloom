type Cfg = { path: string };
export default function CountArray(cfg: Cfg, varName: string): string {
  return `// CountArray ${JSON.stringify(cfg.path)}\nif arr, ok := getPath(${varName}, ${JSON.stringify(cfg.path)}).([]any); ok { setPath(&${varName}, ${JSON.stringify(
    cfg.path
  )}, float64(len(arr))) } else { setPath(&${varName}, ${JSON.stringify(cfg.path)}, float64(0)) }`;
}
