import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, GripVertical, Menu, Trash2 } from "lucide-react";
import { useMemo, type CSSProperties } from "react";
import { getOperationModule } from "@/src/operations";
import { useOpsStore, type OperationType, type State } from "@/src/store/operations";
import type { JSONValue } from "@/src/types/json";
import type { PathIndex } from "@/src/utils/pathSuggest";
import { buildPathIndex } from "@/src/utils/pathSuggest";
import { useIsMobile } from "@/components/hooks/useMediaQuery";
import { editors } from "@/components/opEditors/registry";
import { IfEditorCard, MapArrayEditor, SwitchEditorCard } from "./NestedPipelineEditors";
import WriteResultToField from "./WriteResultToField";
import MobileOperationActions from "./MobileOperationActions";
import { mergeConfig } from "./config";

export default function OperationCard({ id, index }: { id: string; index: number }) {
  const op = useOpsStore((s: State) => s.operations[index]);
  const update = useOpsStore((s: State) => s.updateOperation);
  const remove = useOpsStore((s: State) => s.deleteOperation);
  const reorder = useOpsStore((s: State) => s.reorderOperations);
  const opsAll = useOpsStore((s: State) => s.operations);
  const sourceText = useOpsStore((s: State) => s.sourceText);
  const opIndexes = useOpsStore((s: State) => s.opIndexes);
  const interText = useOpsStore((s: State) => s.intermediate?.[op?.id ?? ""]);
  const allIntermediate = useOpsStore((s: State) => s.intermediate);
  const err = useOpsStore((s: State) => s.pipelineError);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const hasErr = err && err.opId === op?.id ? err.message : undefined;
  const isEnabled = op?.enabled !== false;
  const isMobile = useIsMobile();

  const sourceObj = useMemo(() => {
    try {
      return JSON.parse(sourceText);
    } catch {
      return null;
    }
  }, [sourceText]);

  const fallbackIndex = useMemo(() => buildPathIndex(sourceObj), [sourceObj]);
  const pathIndex: PathIndex = (opIndexes[index] as PathIndex) ?? fallbackIndex;

  const supportsWriteResultTo = useMemo(() => {
    if (!op) return false;
    try {
      const mod = getOperationModule(op.type as OperationType);
      const cfgObj = (op.config && typeof op.config === "object" && !Array.isArray(op.config)) ? (op.config as Record<string, unknown>) : {};
      const defObj = (mod?.defaultConfig && typeof mod.defaultConfig === "object" && !Array.isArray(mod.defaultConfig)) ? (mod.defaultConfig as Record<string, unknown>) : {};
      return "writeResultTo" in cfgObj || "writeResultTo" in defObj;
    } catch {
      return false;
    }
  }, [op]);

  if (!op) return null;

  const onConfigPatch = (patch: Record<string, unknown>) => {
    update(op.id, { config: mergeConfig(op.config, patch) as unknown as JSONValue });
  };

  return (
    <div ref={setNodeRef} style={style} className={`border rounded-md p-3 op-surface ${!isEnabled ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="font-medium flex items-center gap-2">
          <span className={`text-xs px-1.5 py-0.5 rounded border ${!isEnabled ? "line-through" : ""}`}>#{index + 1}</span>
          <span>{op.type}</span>
          {!isEnabled && <span className="text-xs text-neutral-500">(disabled)</span>}
        </div>
        {!isMobile ? (
          <div className="flex gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Switch id={`op-enable-${op.id}`} checked={isEnabled} onCheckedChange={(v) => update(op.id, { enabled: v })} />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label={op.debugOpen ? "Hide result" : "Show result"} className="cursor-pointer" onClick={() => update(op.id, { debugOpen: !op.debugOpen })}>
                  {op.debugOpen ? <EyeOff /> : <Eye />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{op.debugOpen ? "Hide result" : "Show result"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Reorder" className="cursor-move" {...attributes} {...listeners}>
                  <GripVertical />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reorder</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Delete" className="cursor-pointer" onClick={() => remove(op.id)}>
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => update(op.id, { debugOpen: !op.debugOpen })}>
              <Menu />
            </Button>
            <MobileOperationActions
              opId={op.id}
              index={index}
              opCount={opsAll.length}
              isEnabled={isEnabled}
              hasErr={hasErr}
              interText={interText}
              onToggleEnabled={(v) => update(op.id, { enabled: v })}
              onMove={(from, to) => reorder(from, to)}
              onDelete={() => remove(op.id)}
            />
          </div>
        )}
      </div>

      <div className="mt-2">
        {op.type === "MapArray" ? (
          <MapArrayEditor op={op} pathIndex={pathIndex} onUpdate={onConfigPatch} />
        ) : op.type === "If" ? (
          <IfEditorCard op={op} pathIndex={pathIndex} onUpdate={onConfigPatch} />
        ) : op.type === "Switch" ? (
          <SwitchEditorCard op={op} pathIndex={pathIndex} onUpdate={onConfigPatch} />
        ) : (() => {
          const t = op.type as keyof typeof editors;
          const Editor = editors[t];
          if (!Editor) return <div className="text-xs text-neutral-500">No editor available for type &apos;{op.type}&apos;.</div>;

          const rootBefore = (() => {
            if (index === 0) return sourceObj;
            const prev = opsAll[index - 1];
            if (!prev) return sourceObj;
            const prevText = allIntermediate?.[prev.id];
            if (!prevText) return sourceObj;
            try {
              return JSON.parse(prevText) as JSONValue;
            } catch {
              return sourceObj;
            }
          })();

          return (
            <Editor
              config={((op.config && typeof op.config === "object" && !Array.isArray(op.config)) ? (op.config as Record<string, unknown>) : {})}
              onChange={(patch: Record<string, unknown>) => onConfigPatch(patch)}
              pathIndex={pathIndex}
              rootBefore={rootBefore as JSONValue}
            />
          );
        })()}
      </div>

      {supportsWriteResultTo && <WriteResultToField config={op.config} pathIndex={pathIndex} onConfigChange={(next) => update(op.id, { config: next })} />}

      {!isMobile && op.debugOpen && (
        <div className="mt-2 border rounded p-2 op-surface">
          {hasErr ? (
            <div className="text-xs text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-2">{hasErr}</div>
          ) : (
            <div className="text-xs">
              <pre className="overflow-auto max-h-64 whitespace-pre-wrap">{interText ?? ""}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
