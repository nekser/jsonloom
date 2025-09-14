type Cfg = { path: string; depth?: number | "infinity" };

export default function FlattenArray(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const depth = cfg.depth === 'infinity' ? 'Infinity' : String(cfg.depth ?? 1);
  return `// FlattenArray
${varName}${access} = (${varName}${access}||[]).flat(${depth});`;
}
