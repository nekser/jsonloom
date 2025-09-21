type Cfg = { path: string; min: number; max: number };
export default function Clamp(cfg: Cfg, varName: string): string {
  return `// Clamp ${JSON.stringify(cfg.path)}\nif v, ok := getPath(${varName}, ${JSON.stringify(cfg.path)}).(float64); ok {\n  if v < ${cfg.min} { v = ${cfg.min} }\n  if v > ${cfg.max} { v = ${cfg.max} }\n  setPath(&${varName}, ${JSON.stringify(cfg.path)}, v)\n}`;
}
