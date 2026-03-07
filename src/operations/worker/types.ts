import type { Operation } from "@/src/operations";
import type { PipelineExecutionResult, SourceFormat } from "@/src/operations/pipelineExecution";

export type PipelineWorkerRequest = {
  id: number;
  sourceText: string;
  sourceFormat: SourceFormat;
  operations: Operation[];
};

export type PipelineWorkerResponse = {
  id: number;
  result: PipelineExecutionResult;
};
