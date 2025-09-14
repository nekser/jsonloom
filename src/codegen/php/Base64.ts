type Cfg = { path: string; mode: "encode" | "decode" };
import { accessExpr } from "../utils/pathResolution";

export default function Base64(cfg: Cfg, varName: string): string {
  const t = accessExpr("php", varName, cfg.path);
  if (cfg.mode === "decode") return `${t} = base64_decode(${t});`;
  return `${t} = base64_encode(${t});`;
}
