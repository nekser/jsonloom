import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OperationPicker from "@/components/OperationPicker";
import { editors } from "@/components/opEditors/registry";
import { getOperationModule, type Operation } from "@/src/operations";
import type { OperationType } from "@/src/store/operations";
import type { JSONObject, JSONValue } from "@/src/types/json";
import type { PathIndex } from "@/src/utils/pathSuggest";
import { nanoid } from "nanoid";
import { useState } from "react";
import SortableNestedList from "./nested/SortableNestedList";
import type { RenderNestedContent } from "./nested/types";
import { mergeConfig } from "./config";

type Props = {
  op: Operation;
  pathIndex: PathIndex;
  onUpdate: (patch: Record<string, unknown>) => void;
  renderNestedContent: RenderNestedContent;
};

export default function SwitchEditorCard({ op, pathIndex, onUpdate, renderNestedContent }: Props) {
  const config = (op.config as Record<string, unknown>) || {};
  const cases: Array<{ value: string; ops: Operation[] }> = (config.cases as Array<{ value: string; ops: Operation[] }>) ?? [];
  const defOps: Operation[] | undefined = (config.default as Operation[]) ?? [];
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [defaultPickerOpen, setDefaultPickerOpen] = useState(false);
  const [lastAddedCaseOpId, setLastAddedCaseOpId] = useState<Record<number, string | null>>({});
  const [lastAddedDefaultOpId, setLastAddedDefaultOpId] = useState<string | null>(null);

  const addCase = () => {
    onUpdate({ cases: [...cases, { value: "", ops: [] }] });
  };

  const updateCaseValue = (i: number, value: string) => {
    const next = cases.map((c, idx) => (idx === i ? { ...c, value } : c));
    onUpdate({ cases: next });
  };

  const addOpToCase = (i: number, type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: (mod?.defaultConfig as JSONValue) ?? ({} as unknown as JSONObject) };
    const next = cases.map((c, idx) => (idx === i ? { ...c, ops: [...c.ops, newOp] } : c));
    onUpdate({ cases: next });
    setPickerIndex(null);
    setLastAddedCaseOpId((prev) => ({ ...prev, [i]: newOp.id }));
  };

  const updateNested = (i: number, id: string, patch: Partial<Operation>) => {
    const next = cases.map((c, idx) => (idx === i ? {
      ...c,
      ops: c.ops.map((n) => {
        if (n.id !== id) return n;
        const patchCfg = (patch.config && typeof patch.config === "object" && !Array.isArray(patch.config)) ? (patch.config as Record<string, unknown>) : {};
        return { ...n, ...patch, config: mergeConfig(n.config, patchCfg) };
      }),
    } : c));
    onUpdate({ cases: next });
  };

  const deleteNested = (i: number, id: string) => {
    onUpdate({ cases: cases.map((c, idx) => (idx === i ? { ...c, ops: c.ops.filter((n) => n.id !== id) } : c)) });
  };

  const addDefaultOp = (type: OperationType) => {
    const mod = getOperationModule(type);
    const newOp: Operation = { id: nanoid(), type, config: (mod?.defaultConfig as JSONValue) ?? ({} as unknown as JSONObject) };
    onUpdate({ default: [...(defOps ?? []), newOp] });
    setDefaultPickerOpen(false);
    setLastAddedDefaultOpId(newOp.id);
  };

  const updateDefaultNested = (id: string, patch: Partial<Operation>) => {
    const next = (defOps ?? []).map((n) => {
      if (n.id !== id) return n;
      const patchCfg = (patch.config && typeof patch.config === "object" && !Array.isArray(patch.config)) ? (patch.config as Record<string, unknown>) : {};
      return { ...n, ...patch, config: mergeConfig(n.config, patchCfg) };
    });
    onUpdate({ default: next });
  };

  const deleteDefaultNested = (id: string) => {
    onUpdate({ default: (defOps ?? []).filter((n) => n.id !== id) });
  };

  return (
    <div className="flex flex-col gap-3">
      {(() => {
        const t = op.type as keyof typeof editors;
        const Editor = editors[t];
        return Editor ? (
          <Editor config={config as Record<string, unknown>} onChange={(patch: Record<string, unknown>) => onUpdate(patch)} pathIndex={pathIndex} />
        ) : null;
      })()}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={addCase}>Add case</Button>
      </div>
      {cases.map((c, i) => (
        <div key={i} className="border rounded-md p-2 op-surface">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-sm">Case: <Input className="w-full sm:w-40 ml-1 h-7" value={c.value} onChange={(e) => updateCaseValue(i, e.target.value)} /></div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPickerIndex(i)}>Add operation</Button>
            </div>
          </div>
          <SortableNestedList
            ops={c.ops}
            sampleIndex={pathIndex}
            onUpdate={(id, patch) => updateNested(i, id, patch)}
            onDelete={(id) => deleteNested(i, id)}
            onReorder={(arr) => {
              const next = cases.map((cc, idx) => (idx === i ? { ...cc, ops: arr } : cc));
              onUpdate({ cases: next });
            }}
            renderContent={renderNestedContent}
            lastAddedId={lastAddedCaseOpId[i] ?? null}
          />
          <OperationPicker open={pickerIndex === i} onOpenChange={(open) => setPickerIndex(open ? i : null)} onSelect={(t) => addOpToCase(i, t)} />
        </div>
      ))}

      <div className="border rounded-md p-2 op-surface">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-sm">Default</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setDefaultPickerOpen(true)}>Add operation</Button>
          </div>
        </div>
        <SortableNestedList
          ops={defOps ?? []}
          sampleIndex={pathIndex}
          onUpdate={(id, patch) => updateDefaultNested(id, patch)}
          onDelete={(id) => deleteDefaultNested(id)}
          onReorder={(arr) => onUpdate({ default: arr })}
          renderContent={renderNestedContent}
          lastAddedId={lastAddedDefaultOpId}
        />
        <OperationPicker open={defaultPickerOpen} onOpenChange={setDefaultPickerOpen} onSelect={(t) => addDefaultOp(t)} />
      </div>
    </div>
  );
}
