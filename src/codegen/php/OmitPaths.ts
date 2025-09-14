type Cfg = { paths: string[] };

export default function OmitPaths(cfg: Cfg, varName: string): string {
  const paths = cfg.paths || [];
  const lines = paths.map((p) => {
    const segs = p.split('.');
    const head = segs.slice(0,-1).map((s)=>`[${JSON.stringify(s)}]`).join('');
    const last = segs[segs.length-1] ?? '';
    return `if (is_array(${varName}${head})) { unset(${varName}${head}[${JSON.stringify(last)}]); }`;
  }).join("\n");
  return `// OmitPaths\n${lines}`;
}
