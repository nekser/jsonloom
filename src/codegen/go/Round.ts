type Cfg = { path: string; precision?: number };
export default function Round(cfg: Cfg, varName: string): string {
  const p = cfg.precision ?? 0;
  const factor = Math.pow(10, p);
  return `// Round ${JSON.stringify(cfg.path)}\nif v, ok := getPath(${varName}, ${JSON.stringify(cfg.path)}).(float64); ok { setPath(&${varName}, ${JSON.stringify(
    cfg.path
  )}, float64(int(v*${factor})/${factor})) }`;
}
