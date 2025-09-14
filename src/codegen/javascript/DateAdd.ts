type Unit = "days"|"hours"|"minutes"|"months"|"years";
type Cfg = { path: string; amount: number; unit: Unit };

export default function DateAdd(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const amt = cfg.amount|0; const unit = cfg.unit;
  const dateAddBody = `const __da = (iso, amount, unit)=>{ const d = new Date(String(iso)); if (isNaN(d.getTime())) return iso; switch(unit){ case 'days': d.setDate(d.getDate()+amount); break; case 'hours': d.setHours(d.getHours()+amount); break; case 'minutes': d.setMinutes(d.getMinutes()+amount); break; case 'months': d.setMonth(d.getMonth()+amount); break; case 'years': d.setFullYear(d.getFullYear()+amount); break; } return d.toISOString(); };`;
  return `// DateAdd
${dateAddBody}
${varName}${access} = __da(${varName}${access}, ${amt}, ${JSON.stringify(unit)});`;
}
