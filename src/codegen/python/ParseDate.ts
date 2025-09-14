type Cfg = { path: string; format?: string; timezone?: string };

export default function ParseDate(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const fmt = cfg.format ? JSON.stringify(cfg.format) : undefined;
  return `# ParseDate\nfrom datetime import datetime\n__raw = str(${varName}${access})\n__dt = None\ntry:\n  if ${fmt ? 'True' : 'False'}:\n    __dt = datetime.strptime(__raw, ${fmt})\n  else:\n    # try ISO
    __dt = datetime.fromisoformat(__raw.replace('Z', '+00:00'))\nexcept Exception:\n  __dt = None\nif __dt is not None:\n  ${varName}${access} = __dt.isoformat().replace('+00:00','Z')`;
}
