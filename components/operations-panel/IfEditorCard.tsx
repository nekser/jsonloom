import OperationPicker from "@/components/OperationPicker";
import { editors } from "@/components/opEditors/registry";
import { getOperationModule, type Operation } from "@/src/operations";
import type { OperationType } from "@/src/store/operations";
import type { JSONValue } from "@/src/types/json";
import type { PathIndex } from "@/src/utils/pathSuggest";
import { nanoid } from "nanoid";
import { useState } from "react";
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

export default function IfEditorCard({ op, pathIndex, onUpdate, renderNestedContent }: Props) {
  const [thenOpen, setThenOpen] = useState(true);
  const [elseOpen, setElseOpen] = useState(true);
  const configObj = asConfigObject(op.config);
  const nestedThen = toOperationArray(configObj.then);
  const nestedElse = toOperationArray(configObj.else);
  const [thenPickerOpen, setThenPickerOpen] = useState(false);
  const [elsePickerOpen, setElsePickerOpen] = useState(false);
  const [lastAddedThenId, setLastAddedThenId] = useState<string | null>(null);
  const [lastAddedElseId, setLastAddedElseId] = useState<string | null>(null);

  const addNested = (block: "then" | "else", type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: sanitizeConfigValue(mod?.defaultConfig, {} as JSONValue) };
    const key = block === "then" ? "then" : "else";
    const base = asConfigObject(op.config);
    const arr = toOperationArray(base[key]);
    onUpdate({ [key]: asJsonValue([...arr, newOp]) });
    if (block === "then") {
      setThenOpen(true);
      setThenPickerOpen(false);
      setLastAddedThenId(newOp.id);
    } else {
      setElseOpen(true);
      setElsePickerOpen(false);
      setLastAddedElseId(newOp.id);
    }
  };

  const updateNested = (block: "then" | "else", id: string, patch: Partial<Operation>) => {
    const base = asConfigObject(op.config);
    const arr = toOperationArray(base[block]);
    const next = arr.map((n) => {
      if (n.id !== id) return n;
      const patchCfg = asConfigObject(patch.config);
      return { ...n, ...patch, config: mergeConfig(n.config, patchCfg) };
    });
    onUpdate({ [block]: asJsonValue(next) });
  };

  const deleteNested = (block: "then" | "else", id: string) => {
    const base = asConfigObject(op.config);
    const arr = toOperationArray(base[block]);
    onUpdate({ [block]: asJsonValue(arr.filter((n) => n.id !== id)) });
  };

  return (
    <div className="flex flex-col gap-3">
      {(() => {
        const t = op.type as keyof typeof editors;
        const Editor = editors[t];
        return Editor ? (
          <Editor config={asConfigObject(op.config)} onChange={(patch: ConfigPatch) => onUpdate(patch)} pathIndex={pathIndex} />
        ) : null;
      })()}

      <div className="border rounded-md p-2 op-surface">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-sm">Then</div>
          <div className="flex items-center gap-2">
            <button className="text-xs px-2 py-1 rounded border" onClick={() => setThenOpen((v) => !v)}>{thenOpen ? "Hide" : "Show"}</button>
            <button className="text-xs px-2 py-1 rounded border" onClick={() => setThenPickerOpen(true)}>Add operation</button>
          </div>
        </div>
        {thenOpen && (
          <SortableNestedList
            ops={nestedThen}
            sampleIndex={pathIndex}
            onUpdate={(id, patch) => updateNested("then", id, patch)}
            onDelete={(id) => deleteNested("then", id)}
            onReorder={(arr) => onUpdate({ then: asJsonValue(arr) })}
            renderContent={renderNestedContent}
            lastAddedId={lastAddedThenId}
          />
        )}
        <OperationPicker open={thenPickerOpen} onOpenChange={setThenPickerOpen} onSelect={(t) => addNested("then", t)} />
      </div>

      <div className="border rounded-md p-2 op-surface">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-sm">Else</div>
          <div className="flex items-center gap-2">
            <button className="text-xs px-2 py-1 rounded border" onClick={() => setElseOpen((v) => !v)}>{elseOpen ? "Hide" : "Show"}</button>
            <button className="text-xs px-2 py-1 rounded border" onClick={() => setElsePickerOpen(true)}>Add operation</button>
          </div>
        </div>
        {elseOpen && (
          <SortableNestedList
            ops={nestedElse}
            sampleIndex={pathIndex}
            onUpdate={(id, patch) => updateNested("else", id, patch)}
            onDelete={(id) => deleteNested("else", id)}
            onReorder={(arr) => onUpdate({ else: asJsonValue(arr) })}
            renderContent={renderNestedContent}
            lastAddedId={lastAddedElseId}
          />
        )}
        <OperationPicker open={elsePickerOpen} onOpenChange={setElsePickerOpen} onSelect={(t) => addNested("else", t)} />
      </div>
    </div>
  );
}
