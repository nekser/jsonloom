"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Code2, MoreVertical, Plus, Redo2, Share2, ToggleLeft, ToggleRight, Trash2, Undo2, Upload } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { DOCS_AND_CODEGEN_ENABLED } from "@/src/config/features";
import { downloadText } from "../lib/io";
import { State, useOpsStore } from "../src/store/operations";
import { PipelineEncoder } from "../src/utils/sharing/PipelineEncoder";
import { PipelineSerializer } from "../src/utils/sharing/PipelineSerializer";
import { PipelineValidator } from "../src/utils/sharing/PipelineValidator";
import ClearConfirmDialog from "./ClearConfirmDialog";
import GenerateCodeDialog from "./GenerateCodeDialog";
import { useIsMobile } from "./hooks/useMediaQuery";
import ImportPipelineDialog from "./ImportPipelineDialog";
import SharePipelineDialog from "./SharePipelineDialog";

export default function OperationsToolbar() {
  useIsMobile();
  const { ops, setOperations, undo, redo, canUndo, canRedo } = useOpsStore(
    useShallow((s: State) => ({
      ops: s.operations,
      setOperations: s.setOperations,
      undo: s.undo,
      redo: s.redo,
      canUndo: s.past.length > 0,
      canRedo: s.future.length > 0,
    }))
  );

  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareJson, setShareJson] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | undefined>(undefined);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  // Picker trigger is dispatched elsewhere

  const doShare = () => {
    const ser = PipelineSerializer.serialize(ops);
    const enc = PipelineEncoder.encode(ser);
    const url = new URL(window.location.href);
    url.searchParams.set("pipeline", enc);
    const link = url.toString();
    setShareUrl(link);
    setShareJson(JSON.stringify(ser, null, 2));
    setShareOpen(true);
    void navigator.clipboard.writeText(link);
  };

  const doEnableAll = () => {
    const next = ops.map(op => ({ ...op, enabled: true }));
    setOperations(next);
  };
  const doDisableAll = () => {
    const next = ops.map(op => ({ ...op, enabled: false }));
    setOperations(next);
  };
  const doClearAll = () => {
    setConfirmClearOpen(false);
    setOperations([]);
  };

  const doExportJson = () => {
    const ser = PipelineSerializer.serialize(ops);
    const text = JSON.stringify(ser, null, 2);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    downloadText(`pipeline-${ts}.json`, text, "application/json");
  };

  const doCopyJson = async () => {
    const ser = PipelineSerializer.serialize(ops);
    const text = JSON.stringify(ser, null, 2);
    await navigator.clipboard.writeText(text);
  };

  const doImport = () => {
    try {
      setImportError(undefined);
      const raw = importText.trim();
  let nextOps: unknown;

      // 1) JSON (serialized or raw ops array)
      if (raw.startsWith("{") || raw.startsWith("[")) {
        try {
          const json = JSON.parse(raw) as unknown;
          nextOps = Array.isArray(json) ? json : PipelineSerializer.deserialize(json);
        } catch {
          // fall through to encoded/URL path
        }
      }

      // 2) URL or encoded query string
      if (!nextOps) {
        let encoded = raw;
        try {
          const maybeUrl = new URL(encoded);
          encoded = maybeUrl.searchParams.get("pipeline") || encoded;
        } catch {
          // not a URL, treat as plain encoded string
        }
        const decoded = PipelineEncoder.decode(encoded) as unknown;
        nextOps = PipelineSerializer.deserialize(decoded as unknown);
      }

      if (!nextOps || !Array.isArray(nextOps)) { setImportError("Invalid pipeline payload"); return; }
      const v = PipelineValidator.validate(nextOps);
      if (!v.ok) { setImportError(v.error); return; }
      setOperations(nextOps);
      setImportOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to import pipeline";
      setImportError(msg);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-background flex h-12 items-center justify-between px-2 border-b border-neutral-200 dark:border-neutral-800">
     <div className="font-medium flex items-center gap-2">Operations</div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label="Add step"
              className="cursor-pointer"
              onClick={() => {
                window.dispatchEvent(new Event("open-catalog" as unknown as keyof WindowEventMap));
              }}
            >
              <Plus className="h-4 w-4 mr-2" />Add step
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add step</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Undo" className="cursor-pointer" disabled={!canUndo} onClick={undo}>
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Redo" className="cursor-pointer" disabled={!canRedo} onClick={redo}>
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More actions" className="cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={doShare}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </DropdownMenuItem>
            {DOCS_AND_CODEGEN_ENABLED ? (
              <DropdownMenuItem onClick={() => setCodeOpen(true)}>
                <Code2 className="h-4 w-4 mr-2" /> Generate Code
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" /> Import
            </DropdownMenuItem>
            <DropdownMenuItem onClick={doEnableAll}>
              <ToggleRight className="h-4 w-4 mr-2" /> Enable All Operations
            </DropdownMenuItem>
            <DropdownMenuItem onClick={doDisableAll}>
              <ToggleLeft className="h-4 w-4 mr-2" /> Disable All Operations
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmClearOpen(true)} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" /> Clear Pipeline
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Share dialog */}
      <SharePipelineDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        shareUrl={shareUrl}
        shareJson={shareJson}
        onCopyJson={doCopyJson}
        onDownloadJson={doExportJson}
      />

      {/* Import dialog */}
      <ImportPipelineDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        importText={importText}
        setImportText={setImportText}
        importError={importError}
        onImport={doImport}
      />

      {/* Clear confirmation (Dialog) */}
      <ClearConfirmDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        onConfirm={doClearAll}
      />

      {DOCS_AND_CODEGEN_ENABLED ? <GenerateCodeDialog open={codeOpen} onOpenChange={setCodeOpen} /> : null}
    </div>
  );
}
