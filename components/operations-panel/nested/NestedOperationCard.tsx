import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useState, type CSSProperties } from "react";
import OperationHelperDialog from "@/components/operations-panel/OperationHelperDialog";
import type { Operation } from "@/src/operations";
import type { PathIndex } from "@/src/utils/pathSuggest";
import type { RenderNestedContent } from "./types";

type Props = {
  op: Operation;
  sampleIndex: PathIndex;
  onUpdate: (id: string, patch: Partial<Operation>) => void;
  onDelete: (id: string) => void;
  renderContent: RenderNestedContent;
  initialCollapsed?: boolean;
};

export default function NestedOperationCard({ op, sampleIndex, onUpdate, onDelete, renderContent, initialCollapsed }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: op.id });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const [collapsed, setCollapsed] = useState(initialCollapsed ?? false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swiped, setSwiped] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded p-2 op-surface"
      onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchStartX == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
        setSwiped(dx < -60);
        setTouchStartX(null);
      }}
    >
      <div className="flex items-center justify-between">
        <button className="text-sm font-medium text-left" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? ">" : "v"} {op.type}
        </button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="cursor-move" {...attributes} {...listeners}>
            <GripVertical />
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => onDelete(op.id)}>
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete operation</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {swiped && (
        <div className="mt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="sm" onClick={() => onDelete(op.id)}>
                Confirm delete
              </Button>
            </TooltipTrigger>
            <TooltipContent>Confirm deletion</TooltipContent>
          </Tooltip>
        </div>
      )}
      {!collapsed && <div className="mt-2">{renderContent(op, sampleIndex, onUpdate)}</div>}
      <div className="mt-2 flex justify-end">
        <OperationHelperDialog operationType={op.type} />
      </div>
    </div>
  );
}
