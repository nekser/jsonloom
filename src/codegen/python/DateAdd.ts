type Unit = "days"|"hours"|"minutes"|"months"|"years";
type Cfg = { path: string; amount: number; unit: Unit };

export default function DateAdd(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const amt = cfg.amount|0; const unit = cfg.unit;
  return `# DateAdd\nfrom datetime import datetime, timedelta\n__iso = str(${varName}${access})\ntry:\n  __d = datetime.fromisoformat(__iso.replace('Z', '+00:00'))\nexcept Exception:\n  __d = None\nif __d is not None:\n  if ${JSON.stringify(unit)} == 'days':
    __d = __d + timedelta(days=${amt})
  elif ${JSON.stringify(unit)} == 'hours':
    __d = __d + timedelta(hours=${amt})
  elif ${JSON.stringify(unit)} == 'minutes':
    __d = __d + timedelta(minutes=${amt})
  elif ${JSON.stringify(unit)} == 'months':
    # naive month add: approx 30 days per month
    __d = __d + timedelta(days=${amt} * 30)
  elif ${JSON.stringify(unit)} == 'years':
    # naive year add: 365 days per year
    __d = __d + timedelta(days=${amt} * 365)
  ${varName}${access} = __d.isoformat().replace('+00:00','Z')
`;
}
