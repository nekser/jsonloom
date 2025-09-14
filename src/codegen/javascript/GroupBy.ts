type Cfg = { path: string; by: string; collect?: "array" | "count" | "sum"; sumPath?: string };

export default function GroupBy(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const by = JSON.stringify(cfg.by || "");
  const collect = cfg.collect || 'array';
  const sumPath = cfg.sumPath ? JSON.stringify(cfg.sumPath) : undefined;
  return `// GroupBy
{
  const __groups = new Map();
  for (const it of (${varName}${access}||[])) {
    const key = it && typeof it==='object' ? it[${by}] : undefined;
    const k = key === undefined ? '__undefined__' : String(key);
    const arr = __groups.get(k) || [];
    arr.push(it); __groups.set(k, arr);
  }
  let __out;
  ${collect === 'count' ? `__out = Array.from(__groups, ([k, arr]) => ({ key: k, count: arr.length }));` : collect === 'sum' ? `__out = Array.from(__groups, ([k, arr]) => ({ key: k, sum: arr.reduce((a, it)=>a + (it && typeof it==='object' ? Number(it[${sumPath}])||0 : 0), 0) }));` : `__out = Array.from(__groups, ([k, arr]) => ({ key: k, items: arr }));`}
  ${varName}${access} = __out;
}`;
}
