type Cfg = { path: string };
export default function Count(cfg: Cfg, varName: string): string {
  const access = cfg.path.split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `# Count\n${varName}${access} = (len(${varName}${access}) if isinstance(${varName}${access}, (list, tuple)) else 0)`;
}
