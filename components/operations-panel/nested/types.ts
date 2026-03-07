import type { ReactNode } from "react";
import type { Operation } from "@/src/operations";
import type { PathIndex } from "@/src/utils/pathSuggest";

export type NestedOperationUpdate = (id: string, patch: Partial<Operation>) => void;

export type RenderNestedContent = (
  op: Operation,
  sampleIndex: PathIndex,
  onUpdate: NestedOperationUpdate
) => ReactNode;
