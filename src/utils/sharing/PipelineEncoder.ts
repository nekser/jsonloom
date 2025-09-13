import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export const PipelineEncoder = {
  encode(json: unknown): string {
    const raw = JSON.stringify(json);
    return compressToEncodedURIComponent(raw);
  },
  decode<T = unknown>(s: string): T | undefined {
    try {
      const raw = decompressFromEncodedURIComponent(s);
      if (!raw) return undefined;
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  },
};
