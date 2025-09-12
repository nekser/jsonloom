import Papa from "papaparse";

export function importCSV(text: string): { value?: any; error?: string } {
  try {
    const res = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (res.errors && res.errors.length) {
      const msg = res.errors[0]?.message || "CSV parse error";
      return { error: msg };
    }
    return { value: res.data };
  } catch (e: any) {
    return { error: e?.message ?? "Invalid CSV" };
  }
}
