export function importJSON(text: string): { value?: any; error?: string } {
  try {
    return { value: text.trim() === "" ? null : JSON.parse(text) };
  } catch (e: any) {
    return { error: e?.message ?? "Invalid JSON" };
  }
}
