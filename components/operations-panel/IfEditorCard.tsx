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

type Props = {
  op: Operation;
  pathIndex: PathIndex;
  onUpdate: (patch: ConfigPatch) => void;
  renderNestedContent: RenderNestedContent;
};

export default function IfEditorCard({ op, pathIndex, onUpdate, renderNestedContent }: Props) {
  const [thenOpen, setThenOpen] = useState(true);
  const [elseOpen, setElseOpen] = useState(true);
  const configObj = asConfigObject(op.config);
  const nestedThen: Operation[] = (Array.isArray(configObj.then) ? (configObj.then as Operation[]) : []);
  const nestedElse: Operation[] = (Array.isArray(configObj.else) ? (configObj.else as Operation[]) : []);
  const [thenPickerOpen, setThenPickerOpen] = useState(false);
  const [elsePickerOpen, setElsePickerOpen] = useState(false);
  const [lastAddedThenId, setLastAddedThenId] = useState<string | null>(null);
  const [lastAddedElseId, setLastAddedElseId] = useState<string | null>(null);

  const addNested = (block: "then" | "else", type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: (mod?.defaultConfig as JSONValue) ?? {} };
    const key = block === "then" ? "then" : "else";
    const base = asConfigObject(op.config);
    const arr = (Array.isArray(base[key]) ? (base[key] as Operation[]) : []);
    onUpdate({ [key]: [...arr, newOp] });
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
    const arr: Operation[] = (Array.isArray(base[block]) ? (base[block] as Operation[]) : []);
    const next = arr.map((n) => {
      if (n.id !== id) return n;
      const patchCfg = asConfigObject(patch.config);
      return { ...n, ...patch, config: mergeConfig(n.config, patchCfg) };
    });
    onUpdate({ [block]: next });
  };

  const deleteNested = (block: "then" | "else", id: string) => {
    const base = asConfigObject(op.config);
    const arr: Operation[] = (Array.isArray(base[block]) ? (base[block] as Operation[]) : []);
    onUpdate({ [block]: arr.filter((n) => n.id !== id) });
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
            onReorder={(arr) => onUpdate({ then: arr })}
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
            onReorder={(arr) => onUpdate({ else: arr })}
            renderContent={renderNestedContent}
            lastAddedId={lastAddedElseId}
          />
        )}
        <OperationPicker open={elsePickerOpen} onOpenChange={setElsePickerOpen} onSelect={(t) => addNested("else", t)} />
      </div>
    </div>
  );
}
