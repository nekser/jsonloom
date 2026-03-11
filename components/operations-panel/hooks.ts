import { useEffect } from "react";
import { PipelineEncoder } from "@/src/utils/sharing/PipelineEncoder";
import { PipelineSerializer } from "@/src/utils/sharing/PipelineSerializer";
import { PipelineValidator } from "@/src/utils/sharing/PipelineValidator";
import type { Operation } from "@/src/operations";

const SHARE_QUERY_PARAMS = ["data", "pipeline"] as const;

export function getHydrationFromUrl(url: URL): { operations?: Operation[]; sourceText?: string } {
  const out: { operations?: Operation[]; sourceText?: string } = {};
  const encodedData = url.searchParams.get("data");
  if (encodedData) {
    const decodedData = PipelineEncoder.decode(encodedData);
    if (decodedData !== undefined) {
      try {
        out.sourceText = JSON.stringify(decodedData, null, 2);
      } catch {
        // ignore malformed payload
      }
    }
  }

  const encodedPipeline = url.searchParams.get("pipeline");
  if (!encodedPipeline) return out;
  const decodedPipeline = PipelineEncoder.decode(encodedPipeline);
  const ops = PipelineSerializer.deserialize(decodedPipeline);
  if (!ops) return out;
  const validation = PipelineValidator.validate(ops);
  if (!validation.ok) return out;
  out.operations = ops;
  return out;
}

export function removeShareQueryParams(url: URL): boolean {
  let changed = false;
  for (const param of SHARE_QUERY_PARAMS) {
    if (!url.searchParams.has(param)) continue;
    url.searchParams.delete(param);
    changed = true;
  }
  return changed;
}

export function useHydratePipelineFromUrl(setOperations: (ops: Operation[]) => void, setSourceText: (text: string) => void) {
  useEffect(() => {
    const url = new URL(window.location.href);
    const hydrated = getHydrationFromUrl(url);
    if (hydrated.sourceText) setSourceText(hydrated.sourceText);
    if (hydrated.operations) setOperations(hydrated.operations);

    const sanitized = new URL(url.toString());
    if (!removeShareQueryParams(sanitized)) return;
    const nextPath = `${sanitized.pathname}${sanitized.search}${sanitized.hash}`;
    window.history.replaceState(window.history.state, "", nextPath || "/");
  }, [setOperations, setSourceText]);
}

export function useCatalogOpenListener(onOpen: () => void) {
  useEffect(() => {
    const handler = () => onOpen();
    window.addEventListener("open-catalog" as unknown as keyof WindowEventMap, handler as EventListener);
    return () => {
      window.removeEventListener("open-catalog" as unknown as keyof WindowEventMap, handler as EventListener);
    };
  }, [onOpen]);
}
