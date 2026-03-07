"use client";

import clsx from "clsx";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import OperationPicker from "@/components/OperationPicker";
import OperationsToolbar from "@/components/OperationsToolbar";
import { useIsMobile } from "@/components/hooks/useMediaQuery";
import { useOpsStore, type State } from "@/src/store/operations";
import OperationCard from "@/components/operations-panel/OperationCard";
import { useCatalogOpenListener, useHydratePipelineFromUrl } from "@/components/operations-panel/hooks";

export function OperationsPanel() {
  const isMobile = useIsMobile();
  const ops = useOpsStore((s: State) => s.operations);
  const reorder = useOpsStore((s: State) => s.reorderOperations);
  const setOperations = useOpsStore((s: State) => s.setOperations);
  const [pickerOpen, setPickerOpen] = useState(false);

  useHydratePipelineFromUrl(setOperations);
  useCatalogOpenListener(() => setPickerOpen(true));

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
                <OperationCard key={op.id} id={op.id} index={idx} />
              ))}
            </SortableContext>
          </DndContext>
          {ops.length === 0 && <div className="text-sm text-neutral-500">No operations yet. Use Add step above to get started.</div>}
        </div>
      </div>
    </TooltipProvider>
  );
}
