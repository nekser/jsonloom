type Unit = "days"|"hours"|"minutes"|"months"|"years";
type Cfg = { startPath: string; endPath: string; unit: Unit };

export default function DateDiff(cfg: Cfg, varName: string): string {
  const a = (cfg.startPath||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const b = (cfg.endPath||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const outPath = (cfg.endPath + `_diff_${cfg.unit}`).split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const diffFn = `const __dd = (a,b,u)=>{ const da = new Date(String(a)); const db=new Date(String(b)); if (isNaN(da.getTime())||isNaN(db.getTime())) return null; const ms=db.getTime()-da.getTime(); switch(u){ case 'minutes': return Math.round(ms/60000); case 'hours': return Math.round(ms/3600000); case 'days': return Math.round(ms/86400000); case 'months': return Math.round((db.getFullYear()-da.getFullYear())*12 + (db.getMonth()-da.getMonth())); case 'years': return db.getFullYear()-da.getFullYear(); } };`;
  return `// DateDiff
${diffFn}
${varName}${outPath} = __dd(${varName}${a}, ${varName}${b}, ${JSON.stringify(cfg.unit)});`;
}
