type Unit = "days"|"hours"|"minutes"|"months"|"years";
type Cfg = { startPath: string; endPath: string; unit: Unit };

export default function DateDiff(cfg: Cfg, varName: string): string {
  const ap = JSON.stringify(cfg.startPath || "");
  const bp = JSON.stringify(cfg.endPath || "");
  const outp = JSON.stringify(`${cfg.endPath}_diff_${cfg.unit}`);
  return `// DateDiff\n{
  as, _ := getPath(${varName}, ${ap}).(string)
  bs, _ := getPath(${varName}, ${bp}).(string)
  da, errA := time.Parse(time.RFC3339, as)
  db, errB := time.Parse(time.RFC3339, bs)
  if errA == nil && errB == nil {
    switch ${JSON.stringify(cfg.unit)} {
    case "minutes":
      setPath(&${varName}, ${outp}, float64(int(db.Sub(da).Minutes()+0.5)))
    case "hours":
      setPath(&${varName}, ${outp}, float64(int(db.Sub(da).Hours()+0.5)))
    case "days":
      setPath(&${varName}, ${outp}, float64(int(db.Sub(da).Hours()/24+0.5)))
    case "months":
      setPath(&${varName}, ${outp}, float64((db.Year()-da.Year())*12 + int(db.Month())-int(da.Month())))
    case "years":
      setPath(&${varName}, ${outp}, float64(db.Year()-da.Year()))
    }
  } else { setPath(&${varName}, ${outp}, nil) }
}`;
}
