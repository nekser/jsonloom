import { toJqFilterPath } from "../utils/jq";

type Cfg = { path?: string };

export default function DeletePath(cfg: Cfg): string {
  if (!cfg.path || cfg.path === ".") return ".";
  return `del(${toJqFilterPath(cfg.path)})`;
}
