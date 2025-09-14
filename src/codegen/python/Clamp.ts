type Cfg = { path: string; min: number; max: number };
export default function Clamp(cfg: Cfg, varName: string): string {
  const access = (cfg.path || "").split('.').map(s => `[${JSON.stringify(s)}]`).join('');
  return `# Clamp\n${varName}${access} = min(max((${varName}${access} or 0), ${cfg.min}), ${cfg.max})`;
}
