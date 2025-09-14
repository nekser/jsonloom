type Cfg = { path: string; min: number; max: number };
export default function Clamp(cfg: Cfg, varName: string): string {
  const access = cfg.path.split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// Clamp
${varName}${access} = Math.min(${cfg.max}, Math.max(${cfg.min}, (${varName}${access})));`;
}
