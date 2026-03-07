import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Operation } from "@/src/operations";
import type { PathIndex } from "@/src/utils/pathSuggest";
import type { RenderNestedContent } from "./types";
import NestedOperationCard from "./NestedOperationCard";

type Props = {
  ops: Operation[];
  sampleIndex: PathIndex;
  onUpdate: (id: string, patch: Partial<Operation>) => void;
  onDelete: (id: string) => void;
  onReorder: (next: Operation[]) => void;
  renderContent: RenderNestedContent;
  lastAddedId?: string | null;
};

export default function SortableNestedList({ ops, sampleIndex, onUpdate, onDelete, onReorder, renderContent, lastAddedId = null }: Props) {
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = ops.map((n) => n.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    const arr = [...ops];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    onReorder(arr);
  };

  return (
    <DndContext onDragEnd={onDragEnd}>
      <SortableContext items={ops.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {ops.map((n) => (
            <NestedOperationCard
              key={n.id}
              op={n}
              sampleIndex={sampleIndex}
              onUpdate={onUpdate}
              onDelete={onDelete}
              renderContent={renderContent}
              initialCollapsed={n.id !== lastAddedId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
