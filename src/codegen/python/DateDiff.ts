type Unit = "days"|"hours"|"minutes"|"months"|"years";
type Cfg = { startPath: string; endPath: string; unit: Unit };

export default function DateDiff(cfg: Cfg, varName: string): string {
  const a = (cfg.startPath||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const b = (cfg.endPath||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const outPath = (cfg.endPath + `_diff_${cfg.unit}`).split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `# DateDiff (${cfg.unit})\nfrom datetime import datetime\n__sa = str(${varName}${a})\n__sb = str(${varName}${b})\ntry:\n  __da = datetime.fromisoformat(__sa.replace('Z', '+00:00'))\n  __db = datetime.fromisoformat(__sb.replace('Z', '+00:00'))\n  __ms = (__db - __da).total_seconds() * 1000.0\n  __out = None\n  if ${JSON.stringify(cfg.unit)} == 'minutes':\n    __out = round(__ms/60000)\n  elif ${JSON.stringify(cfg.unit)} == 'hours':\n    __out = round(__ms/3600000)\n  elif ${JSON.stringify(cfg.unit)} == 'days':\n    __out = round(__ms/86400000)\n  elif ${JSON.stringify(cfg.unit)} == 'months':\n    __out = (__db.year - __da.year) * 12 + (__db.month - __da.month)\n  elif ${JSON.stringify(cfg.unit)} == 'years':\n    __out = (__db.year - __da.year)\n  ${varName}${outPath} = __out\nexcept Exception:\n  ${varName}${outPath} = None`;
}
