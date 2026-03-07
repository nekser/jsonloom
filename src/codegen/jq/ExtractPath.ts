import { toJqFilterPath } from "../utils/jq";

type Cfg = { path?: string };

export default function ExtractPath(cfg: Cfg): string {
  return toJqFilterPath(cfg.path);
}
