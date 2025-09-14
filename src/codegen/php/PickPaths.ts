type Cfg = { paths: string[] };

export default function PickPaths(cfg: Cfg, varName: string): string {
  const paths = cfg.paths || [];
  const lines = paths.map((p) => {
    const segs = p.split('.').map((s)=>`[${JSON.stringify(s)}]`).join('');
    return `$_out${segs} = ${varName}${segs};`;
  }).join("\n");
  return `// PickPaths\n$_out = [];\n${lines}\n${varName} = $_out;`;
}
