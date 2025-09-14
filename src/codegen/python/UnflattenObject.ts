type Cfg = { path: string; delimiter?: string };

export default function UnflattenObject(cfg: Cfg, varName: string): string {
  const delim = JSON.stringify(cfg.delimiter ?? ".");
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `# UnflattenObject\ndef __unflat(obj):\n  out = {}\n  for flatKey, v in (obj or {}).items():\n    segs = str(flatKey).split(${delim})\n    cur = out\n    for i, s in enumerate(segs):\n      if i == len(segs) - 1:\n        cur[s] = v\n      else:\n        if s not in cur or not isinstance(cur[s], dict):\n          cur[s] = {}\n        cur = cur[s]\n  return out\n${varName}${access} = __unflat(${varName}${access})`;
}
