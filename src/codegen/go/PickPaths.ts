type Cfg = { paths: string[] };

export default function PickPaths(cfg: Cfg, varName: string): string {
  const paths = cfg.paths || [];
  return `// PickPaths\n__out := map[string]any{}\n${paths
    .map((p) => `setPath(&__out, ${JSON.stringify(p)}, getPath(${varName}, ${JSON.stringify(p)}))`)
    .join("\n")}\n${varName} = __out`;
}
