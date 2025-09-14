type Cfg = { path: string; start?: number; end?: number; step?: number };

export default function SliceArray(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const start = cfg.start ?? 0;
  const endPart = cfg.end !== undefined ? String(cfg.end) : "";
  const step = cfg.step && cfg.step !== 1 ? `:${cfg.step}` : "";
  return `# SliceArray\n${varName}${access} = (${varName}${access} or [])[${start}:${endPart}${step}]`;
}
