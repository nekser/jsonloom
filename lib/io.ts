export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

export function downloadText(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function detectFormatFromFilename(name: string | undefined): "json" | "yaml" | "csv" | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase();
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
  if (lower.endsWith(".csv")) return "csv";
  return undefined;
}
