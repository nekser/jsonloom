import { useMemo, useState } from "react";
import { EditorProps } from "./common";
import AutocompleteInput from "../AutocompleteInput";
import { Button } from "@/components/ui/button";
import OperationPicker from "../OperationPicker";
import type { Operation } from "../../src/operations";
import { getOperationModule } from "../../src/operations";
import { sanitizeConfigValue } from "@/src/operations/configPatch";

type SetVariableConfig = { name?: string; op?: Operation };

export default function SetVariableEditor({ config, onChange }: EditorProps<SetVariableConfig>) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const op = config.op;
  const summary = useMemo(() => {
    if (!op) return "No operation selected";
  // access config to form a brief summary
    const cfg = op.config as Record<string, unknown> | undefined;
    const detail = cfg && typeof cfg === "object" && "path" in cfg ? `path: ${String((cfg as Record<string, unknown>).path)}` : "";
    return `${op.type}${detail ? ` (${detail})` : ""}`;
  }, [op]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <AutocompleteInput
          className="flex-1"
          placeholder="Variable name (unique)"
          value={config.name ?? ""}
          getSuggestions={() => []}
          onChange={(v) => onChange({ name: v })}
        />
        <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>Pick operation</Button>
      </div>
      <div className="text-xs text-neutral-600 dark:text-neutral-400">{summary}</div>
      <OperationPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(t) => {
          const mod = getOperationModule(t);
          onChange({ op: { id: "embedded", type: t, config: sanitizeConfigValue(mod?.defaultConfig, {}) } as Operation });
        }}
      />
      <div className="text-xs text-neutral-500">The embedded operation runs once on the root and its result is stored as $vars.{config.name || "<name>"}.</div>
    </div>
  );
}
