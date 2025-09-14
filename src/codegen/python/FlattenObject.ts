type Cfg = { path: string; delimiter?: string; maxDepth?: number };

export default function FlattenObject(cfg: Cfg, varName: string): string {
  const delim = JSON.stringify(cfg.delimiter ?? ".");
  const depth = cfg.maxDepth ?? -1;
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `# FlattenObject\ndef __flat_obj(obj, prefix='', d=0):\n  out = {}\n  for k, v in (obj or {}).items():\n    nk = (prefix + ${delim} + str(k)) if prefix else str(k)\n    if isinstance(v, dict) and (${depth} < 0 or d < ${depth}):\n      out.update(__flat_obj(v, nk, d+1))\n    else:\n      out[nk] = v\n  return out\n${varName}${access} = __flat_obj(${varName}${access})`;
}
