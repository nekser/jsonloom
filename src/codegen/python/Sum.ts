type Cfg = { path: string };
export default function Sum(cfg: Cfg, varName: string): string {
  const access = cfg.path.split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// Sum
${varName}${access} = (Array.isArray(${varName}${access}) ? ${varName}${access}.reduce((a,v)=>a + (typeof v==='number'? v : 0), 0) : 0);`;
}
