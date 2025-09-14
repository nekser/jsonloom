import { literal } from "../utils/helpers";
type Cfg = { path: string; value: unknown };

export default function SetPath(cfg: Cfg, varName: string): string {
  const segs = (cfg.path || "").split('.');
  const access = segs.map(s=>`[${JSON.stringify(s)}]`).join('');
  const val = literal("javascript", cfg.value as any);
  return `// SetPath ${JSON.stringify(cfg.path)}
${varName}${access} = ${val};`;
}
