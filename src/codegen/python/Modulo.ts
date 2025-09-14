type Cfg = { path: string; value: number };
export default function Modulo(cfg: Cfg, varName: string): string {
  const access = cfg.path.split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// Modulo
${varName}${access} = (${varName}${access}) % ${cfg.value};`;
}
