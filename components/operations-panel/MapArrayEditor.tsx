import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OperationType, State } from "@/src/store/operations";
import { useOpsStore } from "@/src/store/operations";
import { getOperationModule, type Operation } from "@/src/operations";
import { getByPath } from "@/src/operations/utils";
import type { JSONValue } from "@/src/types/json";
import type { PathIndex } from "@/src/utils/pathSuggest";
import { buildPathIndex, suggestPathTokens } from "@/src/utils/pathSuggest";
import { nanoid } from "nanoid";
import OperationPicker from "@/components/OperationPicker";
import AutocompleteInput from "@/components/AutocompleteInput";
import SortableNestedList from "./nested/SortableNestedList";
import type { RenderNestedContent } from "./nested/types";
import { asConfigObject, mergeConfig, type ConfigPatch } from "./config";
import { sanitizeConfigValue } from "@/src/operations/configPatch";

type Props = {
  op: Operation;
  pathIndex: PathIndex;
  onUpdate: (patch: ConfigPatch) => void;
  renderNestedContent: RenderNestedContent;
};

function isOperationLike(value: unknown): value is Operation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.type === "string" && "config" in v;
}

function toOperationArray(value: unknown): Operation[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isOperationLike);
}

function asJsonValue(value: Operation[]): JSONValue {
  return value as unknown as JSONValue;
}

export default function MapArrayEditor({ op, pathIndex, onUpdate, renderNestedContent }: Props) {
  const [open, setOpen] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const sourceText = useOpsStore((s: State) => s.sourceText);

  const sourceObj = useMemo(() => {
    try {
      return JSON.parse(sourceText);
    } catch {
      return null;
    }
  }, [sourceText]);
  const configObj = useMemo(() => asConfigObject(op.config), [op.config]);

  const cfgPath = useMemo(() => {
    const cfg = configObj;
    return typeof cfg.path === "string" ? cfg.path : "";
  }, [configObj]);

  const sampleIndex: PathIndex = useMemo(() => {
    if (!sourceObj) return pathIndex;
    try {
      const arr = getByPath(sourceObj as JSONValue, cfgPath);
      if (Array.isArray(arr) && arr.length > 0) return buildPathIndex(arr[0]);
    } catch {
      // ignore JSON path errors for sample index lookup
    }
    return pathIndex;
  }, [sourceObj, pathIndex, cfgPath]);

  const nestedOps = toOperationArray(configObj.operations);

  const onAddNested = (type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: sanitizeConfigValue(mod?.defaultConfig, {} as JSONValue) };
    onUpdate({ operations: asJsonValue([...nestedOps, newOp]) });
    setPickerOpen(false);
    setLastAddedId(newOp.id);
  };

  const onUpdateNested = (id: string, patch: Partial<Operation>) => {
    const next = nestedOps.map((n) => {
      if (n.id !== id) return n;
      const patchCfg = asConfigObject(patch.config);
      return { ...n, ...patch, config: mergeConfig(n.config, patchCfg) };
    });
    onUpdate({ operations: asJsonValue(next) });
  };

  const onDeleteNested = (id: string) => {
    onUpdate({ operations: asJsonValue(nestedOps.filter((n) => n.id !== id)) });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <AutocompleteInput
          className="w-full"
          placeholder="path e.g. items"
          value={typeof configObj.path === "string" ? (configObj.path as string) : ""}
          getSuggestions={(q) => suggestPathTokens(pathIndex, q)}
          onChange={(v) => onUpdate({ path: v })}
        />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Show"} operations
        </Button>
        <div className="flex items-center gap-2 text-xs">
          <span>onError</span>
          <Select value={(configObj.onError as string) ?? "propagate"} onValueChange={(v) => onUpdate({ onError: v })}>
            <SelectTrigger className="h-7 px-2 py-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="propagate">propagate</SelectItem>
              <SelectItem value="skip">skip element</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {open && (
        <div className="mt-1 border rounded-md p-2 op-surface">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-sm">Operations</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add step
              </Button>
            </div>
          </div>
          <SortableNestedList
            ops={nestedOps}
            sampleIndex={sampleIndex}
            onUpdate={onUpdateNested}
            onDelete={onDeleteNested}
            onReorder={(arr) => onUpdate({ operations: asJsonValue(arr) })}
            renderContent={renderNestedContent}
            lastAddedId={lastAddedId}
          />
          <OperationPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(t) => onAddNested(t)} />
        </div>
      )}
    </div>
  );
}
