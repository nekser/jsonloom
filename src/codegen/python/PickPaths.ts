type Cfg = { paths: string[] };

export default function PickPaths(cfg: Cfg, varName: string): string {
  const paths = cfg.paths || [];
  const lines = paths.map((p) => {
    const segs = p.split('.');
    const get = segs.map((s)=>`[${JSON.stringify(s)}]`).join('');
    const assign = segs.map((s)=>`[${JSON.stringify(s)}]`).join('');
    return `try:\n  __out${assign} = ${varName}${get}\nexcept Exception:\n  pass`;
  }).join("\n");
  return `# PickPaths\n__out = {}\n${lines}\n${varName} = __out`;
}
