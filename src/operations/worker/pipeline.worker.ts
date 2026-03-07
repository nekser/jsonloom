/// <reference lib="webworker" />

import { executePipelineFromSource } from "@/src/operations/pipelineExecution";
import type { PipelineWorkerRequest, PipelineWorkerResponse } from "@/src/operations/worker/types";

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (event: MessageEvent<PipelineWorkerRequest>) => {
  const req = event.data;
  const result = executePipelineFromSource({
    sourceText: req.sourceText,
    sourceFormat: req.sourceFormat,
    operations: req.operations,
  });

  const response: PipelineWorkerResponse = {
    id: req.id,
    result,
  };

  self.postMessage(response);
};

export {};
