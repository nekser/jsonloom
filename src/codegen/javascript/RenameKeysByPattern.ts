type Cfg = { pattern: string; replace: string; flags?: string };

export default function RenameKeysByPattern(cfg: Cfg, varName: string): string {
  const pattern = JSON.stringify(cfg.pattern || "");
  const flags = JSON.stringify(cfg.flags || "g");
  const replace = JSON.stringify(cfg.replace || "");
  return `// RenameKeysByPattern
const __rkbp_re = new RegExp(${pattern}, ${flags});
const __rkbp = (v) => {
  if (Array.isArray(v)) return v.map(__rkbp);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      const nk = k.replace(__rkbp_re, ${replace});
      out[nk] = __rkbp(val);
    }
    return out;
  }
  return v;
};
${varName} = __rkbp(${varName});`;
}
