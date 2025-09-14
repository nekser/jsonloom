type Cfg = { path: string; compareTo: string | { path: string }; op: "after"|"afterOrEqual"|"before"|"beforeOrEqual"; resultPath?: string };

export default function IsDateCompare(cfg: Cfg, varName: string): string {
  const a = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const b = typeof cfg.compareTo === 'string' ? JSON.stringify(cfg.compareTo) : (cfg.compareTo?.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const getB = typeof cfg.compareTo === 'string' ? `${JSON.stringify(cfg.compareTo)}` : `${varName}${b}`;
  const cmp = (op: Cfg['op']) => {
    switch(op){
      case 'after': return '(da>db)';
      case 'afterOrEqual': return '(da>=db)';
      case 'before': return '(da<db)';
      case 'beforeOrEqual': return '(da<=db)';
    }
  };
  const resPath = cfg.resultPath ? (cfg.resultPath.split('.').map(s=>`[${JSON.stringify(s)}]`).join('')) : a;
  return `// IsDateCompare
{
  const da = new Date(String(${varName}${a})).getTime();
  const db = new Date(String(${getB})).getTime();
  const ok = isFinite(da) && isFinite(db);
  const __res = ok ? ${cmp(cfg.op)} : false;
  ${varName}${resPath} = __res;
}`;
}
