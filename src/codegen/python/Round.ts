type Cfg = { path: string; precision?: number };
export default function Round(cfg: Cfg, varName: string): string {
  const access = cfg.path.split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const p = cfg.precision ?? 0; const factor = Math.pow(10, p);
  return `// Round
${varName}${access} = Math.round((${varName}${access}) * ${factor}) / ${factor};`;
}
