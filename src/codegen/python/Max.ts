type Cfg = { path: string };
export default function Max(cfg: Cfg, varName: string): string {
  const access = cfg.path.split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// Max
${varName}${access} = (Array.isArray(${varName}${access}) && ${varName}${access}.length ? Math.max(...${varName}${access}.filter(v=>typeof v==='number')) : null);`;
}
