type Cfg = { path: string };
export default function Count(cfg: Cfg, varName: string): string {
  const access = cfg.path.split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// Count
${varName}${access} = (Array.isArray(${varName}${access}) ? ${varName}${access}.length : 0);`;
}
