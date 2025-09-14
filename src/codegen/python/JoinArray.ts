type Cfg = { path: string; delimiter?: string };

export default function JoinArray(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const delim = JSON.stringify(cfg.delimiter ?? ',');
  return `// JoinArray
${varName}${access} = (${varName}${access}||[]).map(v=>v==null?"":String(v)).join(${delim});`;
}
