type Unit = "days"|"hours"|"minutes"|"months"|"years";
type Cfg = { path: string; amount: number; unit: Unit };

export default function DateAdd(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  const amt = Math.trunc(cfg.amount);
  const unit = cfg.unit;
  return `// DateAdd\nif s, ok := getPath(${varName}, ${p}).(string); ok { if t, err := time.Parse(time.RFC3339, s); err == nil {\n  d := t\n  switch ${JSON.stringify(unit)} {\n  case "days": d = d.Add(time.Duration(${amt}) * 24 * time.Hour)\n  case "hours": d = d.Add(time.Duration(${amt}) * time.Hour)\n  case "minutes": d = d.Add(time.Duration(${amt}) * time.Minute)\n  case "months": d = d.AddDate(0, ${amt}, 0)\n  case "years": d = d.AddDate(${amt}, 0, 0)\n  }\n  setPath(&${varName}, ${p}, d.Format(time.RFC3339))\n} }`;
}
