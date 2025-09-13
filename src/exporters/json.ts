export function exportJSON(value: any): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}
