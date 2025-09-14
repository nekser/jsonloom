type Cfg = { path: string };

export default function CountArray(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// CountArray
${varName}${access} = Array.isArray(${varName}${access}) ? ${varName}${access}.length : 0;`;
}
