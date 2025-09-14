type Cfg = { path: string };

export default function ExtractPath(cfg: Cfg, varName: string): string {
  const path = cfg.path || "";
  if (!path) return `# ExtractPath (noop)\n${varName} = ${varName}`;
  const segs = path.split('.');
  const access = segs.map(s=>`[${JSON.stringify(s)}]`).join('');
  return `# ExtractPath ${JSON.stringify(path)}\n${varName} = (${varName} or {})\ntry:\n  ${varName} = ${varName}${access}\nexcept Exception:\n  ${varName} = None`;
}
