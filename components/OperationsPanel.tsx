"use client";

import clsx from "clsx";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { TooltipProvider } from "@/components/ui/tooltip";
import OperationPicker from "@/components/OperationPicker";
import OperationsToolbar from "@/components/OperationsToolbar";
import { useIsMobile } from "@/components/hooks/useMediaQuery";
import { useOpsStore, type State } from "@/src/store/operations";
import OperationCard from "@/components/operations-panel/OperationCard";
import { useCatalogOpenListener, useHydratePipelineFromUrl } from "@/components/operations-panel/hooks";
import { buildPathIndex, type PathIndex } from "@/src/utils/pathSuggest";
import type { JSONValue } from "@/src/types/json";

export function OperationsPanel() {
  const isMobile = useIsMobile();
  const { ops, reorder, setOperations, sourceText } = useOpsStore(
    useShallow((s: State) => ({
      ops: s.operations,
      reorder: s.reorderOperations,
      setOperations: s.setOperations,
      sourceText: s.sourceText,
    }))
  );
  const setSourceText = useOpsStore((s: State) => s.setSourceText);
  const [pickerOpen, setPickerOpen] = useState(false);

  useHydratePipelineFromUrl(setOperations, setSourceText);
  useCatalogOpenListener(() => setPickerOpen(true));

  const sourceObj = useMemo(() => {
    try {
      return JSON.parse(sourceText) as JSONValue;
    } catch {
      return null;
    }
  }, [sourceText]);
  const sourceFallbackIndex: PathIndex = useMemo(() => buildPathIndex(sourceObj), [sourceObj]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ops.findIndex((o: { id: string }) => o.id === active.id);
    const newIndex = ops.findIndex((o: { id: string }) => o.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) reorder(oldIndex, newIndex);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full min-h-0">
        <OperationsToolbar />
        <OperationPicker open={pickerOpen} onOpenChange={setPickerOpen} />

        <div className={clsx("flex-1 min-h-0 overflow-auto p-3", isMobile ? "space-y-2" : "space-y-3")}>
          <DndContext onDragEnd={onDragEnd}>
            <SortableContext items={ops.map((o: { id: string }) => o.id)} strategy={verticalListSortingStrategy}>
              {ops.map((op: { id: string }, idx: number) => (
                <OperationCard
                  key={op.id}
                  id={op.id}
                  index={idx}
                  opCount={ops.length}
                  prevOpId={idx > 0 ? ops[idx - 1]?.id : undefined}
                  sourceObj={sourceObj}
                  sourceFallbackIndex={sourceFallbackIndex}
                />
              ))}
            </SortableContext>
          </DndContext>
          {ops.length === 0 && <div className="text-sm text-neutral-500">No operations yet. Use Add step above to get started.</div>}
        </div>
      </div>
    </TooltipProvider>
  );
}
