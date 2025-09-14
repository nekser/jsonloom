type Cfg = { paths: string[] };

export default function OmitPaths(cfg: Cfg, varName: string): string {
  const paths = cfg.paths || [];
  return `// OmitPaths
const __op_clone = (v) => Array.isArray(v) ? v.map(__op_clone) : (v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k,val])=>[k,__op_clone(val)])) : v);
const __root = __op_clone(${varName});
${paths.map(p => {
    const segs = p.split('.');
    const head = segs.slice(0, -1).map(s=>`[${JSON.stringify(s)}]`).join('');
    const last = segs[segs.length-1];
    return `if (__root${head} && typeof __root${head} === 'object') delete __root${head}[${JSON.stringify(last)}];`;
  }).join('\n')}
${varName} = __root;`;
}
