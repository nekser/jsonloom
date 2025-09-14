type Cfg = { path: string; delimiter?: string };

export default function JoinArray(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const delim = JSON.stringify(cfg.delimiter ?? ',');
  return `# JoinArray\n${varName}${access} = ${delim}.join([(str(v) if v is not None else '') for v in (${varName}${access} or [])])`;
}
