type Cfg = { path: string; value: number };
export default function Power(cfg: Cfg, varName: string): string {
  const access = cfg.path.split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// Power
${varName}${access} = Math.pow(${varName}${access}, ${cfg.value});`;
}
