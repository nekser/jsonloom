"use client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ImportPipelineDialog({
  open,
  onOpenChange,
  importText,
  setImportText,
  importError,
  onImport,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  importText: string;
  setImportText: (v: string) => void;
  importError?: string;
  onImport: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Pipeline</DialogTitle>
          <DialogDescription>
            Paste one of: encoded &#39;pipeline&#39; value, a full URL containing it, or JSON (either the serialized object with schemaVersion/ops or a raw ops array).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea
            className="h-36"
            placeholder="Paste encoded string, full URL, or JSON (serialized { schemaVersion, ops } or just [ ...ops ])"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          {importError && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">{importError}</div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onImport}>Import</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
