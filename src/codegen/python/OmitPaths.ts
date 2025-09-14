type Cfg = { paths: string[] };

export default function OmitPaths(cfg: Cfg, varName: string): string {
  const paths = cfg.paths || [];
  const delLines = paths.map(p => {
    const segs = p.split('.');
    const head = segs.slice(0,-1).map(s=>`[${JSON.stringify(s)}]`).join('');
    const last = segs[segs.length-1] ?? "";
    return `try:\n  _t = __root${head}\n  if isinstance(_t, dict): _t.pop(${JSON.stringify(last)}, None)\nexcept Exception:\n  pass`;
  }).join('\n');
  return `# OmitPaths\nimport copy\n__root = copy.deepcopy(${varName})\n${delLines}\n${varName} = __root`;
}
