import { useEffect } from "react";
import { PipelineEncoder } from "@/src/utils/sharing/PipelineEncoder";
import { PipelineSerializer } from "@/src/utils/sharing/PipelineSerializer";
import { PipelineValidator } from "@/src/utils/sharing/PipelineValidator";
import type { Operation } from "@/src/operations";

export function useHydratePipelineFromUrl(setOperations: (ops: Operation[]) => void) {
  useEffect(() => {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get("pipeline");
    if (!encoded) return;

    const decoded = PipelineEncoder.decode(encoded);
    const ops = PipelineSerializer.deserialize(decoded);
    if (!ops) return;

    const validation = PipelineValidator.validate(ops);
    if (!validation.ok) return;
    setOperations(ops);
  }, [setOperations]);
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
