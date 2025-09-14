type Cfg = { path: string; delimiter?: string };

export default function UnflattenObject(cfg: Cfg, varName: string): string {
  const delim = JSON.stringify(cfg.delimiter ?? ".");
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// UnflattenObject
const __unflat = (obj) => {
  const out = {};
  for (const [flatKey, v] of Object.entries(obj || {})) {
    const segs = String(flatKey).split(${delim});
    let cur = out;
    for (let i=0;i<segs.length;i++) {
      const s = segs[i];
      if (i === segs.length - 1) cur[s] = v; else cur = (cur[s] ||= {});
    }
  }
  return out;
};
${varName}${access} = __unflat(${varName}${access});`;
}
