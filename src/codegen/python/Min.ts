type Cfg = { path: string };
export default function Min(cfg: Cfg, varName: string): string {
  const access = cfg.path.split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// Min
${varName}${access} = (Array.isArray(${varName}${access}) && ${varName}${access}.length ? Math.min(...${varName}${access}.filter(v=>typeof v==='number')) : null);`;
}
