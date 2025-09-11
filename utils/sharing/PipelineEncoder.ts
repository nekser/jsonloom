import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export const PipelineEncoder = {
  encode(json: any): string {
    const raw = JSON.stringify(json);
    return compressToEncodedURIComponent(raw);
  },
  decode(s: string): any | undefined {
    try {
      const raw = decompressFromEncodedURIComponent(s);
      if (!raw) return undefined;
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  },
};
