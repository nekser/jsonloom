import { toJqFilterPath } from "../utils/jq";

type Cfg = { path?: string };

export default function CountArray(cfg: Cfg): string {
  return `${toJqFilterPath(cfg.path)} |= (if type == "array" then length else . end)`;
}
