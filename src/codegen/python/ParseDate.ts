type Cfg = { path: string; format: string; timezone?: string };

export default function ParseDate(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// ParseDate (format hint ${JSON.stringify(cfg.format)})
{
  const __raw = ${varName}${access};
  const __d = new Date(String(__raw));
  if (!isNaN(__d.getTime())) ${varName}${access} = __d.toISOString();
}`;
}
