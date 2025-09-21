type Cfg = { paths: string[] };

export default function OmitPaths(cfg: Cfg, varName: string): string {
  const paths = cfg.paths || [];
  return `// OmitPaths\n__root := ${varName}\n${paths
    .map((p) => {
      const segs = p.split(".");
      const head = segs.slice(0, -1).join(".");
      const last = segs[segs.length - 1];
      return `if m, ok := getPath(__root, ${JSON.stringify(head)}).(map[string]any); ok { delete(m, ${JSON.stringify(
        last
      )}) }`;
    })
    .join("\n")}\n${varName} = __root`;
}
