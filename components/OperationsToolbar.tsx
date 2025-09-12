"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "./hooks/useMediaQuery";
import { useOpsStore, State } from "../store/operations";
import { PipelineSerializer } from "../utils/sharing/PipelineSerializer";
import { PipelineEncoder } from "../utils/sharing/PipelineEncoder";
import { PipelineValidator } from "../utils/sharing/PipelineValidator";
import { Plus, MoreVertical, Trash2, ToggleRight, ToggleLeft, Share2, Upload, Download, Copy } from "lucide-react";
import { downloadText } from "../lib/io";

export default function OperationsToolbar() {
  const isMobile = useIsMobile();
  const ops = useOpsStore((s: State) => s.operations);
  const setOperations = useOpsStore((s: State) => s.setOperations);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | undefined>(undefined);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const openPicker = () => {
    window.dispatchEvent(new Event("open-catalog" as any));
  };

  const doShare = () => {
    const ser = PipelineSerializer.serialize(ops as any);
    const enc = PipelineEncoder.encode(ser);
    const url = new URL(window.location.href);
    url.searchParams.set("pipeline", enc);
    const link = url.toString();
    setShareUrl(link);
    setShareOpen(true);
    void navigator.clipboard.writeText(link);
  };

  const doEnableAll = () => {
    const next = (ops as any[]).map(op => ({ ...op, enabled: true }));
    setOperations(next as any);
  };
  const doDisableAll = () => {
    const next = (ops as any[]).map(op => ({ ...op, enabled: false }));
    setOperations(next as any);
  };
  const doClearAll = () => {
    setConfirmClearOpen(false);
    setOperations([]);
  };

  const doExportJson = () => {
    const ser = PipelineSerializer.serialize(ops as any);
    const text = JSON.stringify(ser, null, 2);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    downloadText(`pipeline-${ts}.json`, text, "application/json");
  };

  const doCopyJson = async () => {
    const ser = PipelineSerializer.serialize(ops as any);
    const text = JSON.stringify(ser, null, 2);
    await navigator.clipboard.writeText(text);
  };

  const doImport = () => {
    try {
      setImportError(undefined);
      const raw = importText.trim();
      let nextOps: any[] | undefined;

      // 1) JSON (serialized or raw ops array)
      if (raw.startsWith("{") || raw.startsWith("[")) {
        try {
          const json = JSON.parse(raw);
          nextOps = Array.isArray(json) ? json : PipelineSerializer.deserialize(json);
        } catch (e) {
          // fall through to encoded/URL path
        }
      }

      // 2) URL or encoded query string
      if (!nextOps) {
        let encoded = raw;
        try {
          const maybeUrl = new URL(encoded);
          encoded = maybeUrl.searchParams.get("pipeline") || encoded;
        } catch {}
        const decoded = PipelineEncoder.decode(encoded);
        nextOps = PipelineSerializer.deserialize(decoded);
      }

      if (!nextOps) { setImportError("Invalid pipeline payload"); return; }
      const v = PipelineValidator.validate(nextOps as any);
      if (!v.ok) { setImportError(v.error); return; }
      setOperations(nextOps as any);
      setImportOpen(false);
    } catch (e: any) {
      setImportError(e?.message || "Failed to import pipeline");
    }
  };

  return (
    <div className="flex h-12 items-center justify-between px-2 border-b border-neutral-200 dark:border-neutral-800">
      <div className="font-medium flex items-center gap-2">Operations</div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={openPicker} size={isMobile ? "icon" : "sm"}>
          <Plus className="h-4 w-4" />
          {!isMobile && <span className="ml-1">Add Step</span>}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={doShare}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={doCopyJson}>
              <Copy className="h-4 w-4 mr-2" /> Copy as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={doExportJson}>
              <Download className="h-4 w-4 mr-2" /> Export as JSON
            </DropdownMenuItem>
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
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Pipeline</DialogTitle>
            <DialogDescription>Copy the link below to share your current pipeline.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={shareUrl} readOnly />
            <div className="flex gap-2">
              <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(shareUrl); }}>Copy link</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Pipeline</DialogTitle>
            <DialogDescription>
              Paste one of: encoded 'pipeline' value, a full URL containing it, or JSON (either the serialized object with v/ops or a raw ops array).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea className="h-36" placeholder="Paste encoded string, full URL, or JSON (serialized { v, ops } or just [ ...ops ])" value={importText} onChange={(e) => setImportText(e.target.value)} />
            {importError && <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">{importError}</div>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={doImport}>Import</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear confirmation (Dialog) */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all operations?</DialogTitle>
            <DialogDescription>This will remove all operations from the pipeline. You can undo this action.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmClearOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={doClearAll}>Clear</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
