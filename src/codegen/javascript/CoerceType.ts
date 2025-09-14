type Cfg = { path: string; to: "string"|"number"|"boolean"|"object"|"array"; fallback?: unknown };

export default function CoerceType(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const to = cfg.to;
  const fb = cfg.fallback !== undefined ? JSON.stringify(cfg.fallback) : undefined;
  const coerceFn = `const __coerce = (v, to) => {
  try {
    switch(to){
      case 'string': return String(v ?? '');
      case 'number': { const n = typeof v==='number'? v : Number(v); if (!Number.isFinite(n)) throw 0; return n; }
      case 'boolean': {
        if (typeof v==='boolean') return v; if (typeof v==='number') return v!==0;
        if (typeof v==='string'){ const s=v.trim().toLowerCase(); if(['true','1','yes','y'].includes(s)) return true; if(['false','0','no','n'].includes(s)) return false; return s.length>0; }
        return !!v;
      }
      case 'object': { if (v && typeof v==='object' && !Array.isArray(v)) return v; if (typeof v==='string'){ const p=JSON.parse(v); if (p && typeof p==='object' && !Array.isArray(p)) return p; } throw 0; }
      case 'array': { if (Array.isArray(v)) return v; if (typeof v==='string'){ const p=JSON.parse(v); if (Array.isArray(p)) return p; } throw 0; }
    }
  } catch { throw 0; }
};`;
  const tryBlock = fb !== undefined
    ? `let __newVal; try { __newVal = __coerce(${varName}${access}, '${to}'); } catch { __newVal = ${fb}; }
${varName}${access} = __newVal;`
    : `${varName}${access} = __coerce(${varName}${access}, '${to}');`;
  return `// CoerceType
${coerceFn}
${tryBlock}`;
}
