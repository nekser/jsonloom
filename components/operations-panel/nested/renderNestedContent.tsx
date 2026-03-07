import { editors } from "@/components/opEditors/registry";
import type { Operation } from "@/src/operations";
import type { PathIndex } from "@/src/utils/pathSuggest";
import MapArrayEditor from "@/components/operations-panel/MapArrayEditor";
import IfEditorCard from "@/components/operations-panel/IfEditorCard";
import SwitchEditorCard from "@/components/operations-panel/SwitchEditorCard";
import { mergeConfig } from "@/components/operations-panel/config";
import type { RenderNestedContent } from "./types";

export function createNestedContentRenderer(): RenderNestedContent {
  const renderNestedContent: RenderNestedContent = (op: Operation, sampleIndex: PathIndex, onUpdate) => {
    if (op.type === "MapArray") {
      return (
        <MapArrayEditor
          op={op}
          pathIndex={sampleIndex}
          onUpdate={(cfg) => onUpdate(op.id, { config: mergeConfig(op.config, cfg) })}
          renderNestedContent={renderNestedContent}
        />
      );
    }

    if (op.type === "If") {
      return (
        <IfEditorCard
          op={op}
          pathIndex={sampleIndex}
          onUpdate={(cfg) => onUpdate(op.id, { config: mergeConfig(op.config, cfg) })}
          renderNestedContent={renderNestedContent}
        />
      );
    }

    if (op.type === "Switch") {
      return (
        <SwitchEditorCard
          op={op}
          pathIndex={sampleIndex}
          onUpdate={(cfg) => onUpdate(op.id, { config: mergeConfig(op.config, cfg) })}
          renderNestedContent={renderNestedContent}
        />
      );
    }

    const t = op.type as keyof typeof editors;
    const Editor = editors[t];
    if (!Editor) return null;

    return (
      <Editor
        config={((op.config && typeof op.config === "object" && !Array.isArray(op.config)) ? (op.config as Record<string, unknown>) : {})}
        onChange={(patch: Record<string, unknown>) => {
          onUpdate(op.id, { config: mergeConfig(op.config, patch) });
        }}
        pathIndex={sampleIndex}
      />
    );
  };

  return renderNestedContent;
}
