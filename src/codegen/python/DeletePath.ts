type Cfg = { path: string };

export default function DeletePath(cfg: Cfg, varName: string): string {
  const segs = (cfg.path || "").split('.');
  const head = segs.slice(0,-1).map(s=>`[${JSON.stringify(s)}]`).join('');
  const last = segs[segs.length-1] ?? "";
  return `# DeletePath ${JSON.stringify(cfg.path)}\ntry:\n  _tmp = ${varName}${head}\n  if isinstance(_tmp, dict) and ${JSON.stringify(last)} in _tmp:\n    _tmp.pop(${JSON.stringify(last)}, None)\nexcept Exception:\n  pass`;
}
