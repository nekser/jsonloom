type Cfg = { path: string; by?: string; op: "sum" | "avg" | "min" | "max" | "concat" };

export default function ReduceArray(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const by = cfg.by ? JSON.stringify(cfg.by) : undefined;
  const val = by ? `(it && typeof it==='object'? it[${by}] : undefined)` : `it`;
  const code = {
    sum: `(${varName}${access}||[]).reduce((a,it)=>a + (typeof ${val}==='number'? ${val} : 0), 0)`,
    avg: `(()=>{const __arr=(${varName}${access}||[]).map(it=>(${val})).filter(v=>typeof v==='number'); return __arr.length? __arr.reduce((a,b)=>a+b,0)/__arr.length : 0;})()`,
    min: `(()=>{const __arr=(${varName}${access}||[]).map(it=>(${val})).filter(v=>typeof v==='number'); return __arr.length? Math.min(...__arr) : null;})()`,
    max: `(()=>{const __arr=(${varName}${access}||[]).map(it=>(${val})).filter(v=>typeof v==='number'); return __arr.length? Math.max(...__arr) : null;})()`,
    concat: `(${varName}${access}||[]).map(it=>(${val})).join('')`,
  }[cfg.op];
  return `// ReduceArray (${cfg.op})
${varName}${access} = ${code};`;
}
