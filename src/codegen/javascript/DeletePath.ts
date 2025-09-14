type Cfg = { path: string };

export default function DeletePath(cfg: Cfg, varName: string): string {
  const segs = (cfg.path || "").split('.');
  const head = segs.slice(0,-1).map(s=>`[${JSON.stringify(s)}]`).join('');
  const last = segs[segs.length-1] ?? "";
  return `// DeletePath ${JSON.stringify(cfg.path)}
if (${varName}${head} && typeof ${varName}${head} === 'object') delete ${varName}${head}[${JSON.stringify(last)}];`;
}
