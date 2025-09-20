"use client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Share2 } from "lucide-react";

export default function SharePipelineDialog({
  open,
  onOpenChange,
  shareUrl,
  shareJson,
  onCopyJson,
  onDownloadJson,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  shareUrl: string;
  shareJson: string;
  onCopyJson: () => void;
  onDownloadJson: () => void;
}) {
  const copyLink = async () => { await navigator.clipboard.writeText(shareUrl); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Pipeline</DialogTitle>
          <DialogDescription>Copy the link or JSON for your current pipeline.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input value={shareUrl} readOnly />
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyLink}>
              <Share2 className="h-4 w-4 mr-2" />Copy link
            </Button>
            <Button variant="outline" onClick={onCopyJson}>
              <Copy className="h-4 w-4 mr-2" />Copy JSON
            </Button>
            <Button variant="outline" onClick={onDownloadJson}>
              <Download className="h-4 w-4 mr-2" />Download JSON
            </Button>
          </div>
          <div>
            <Textarea className="h-36" value={shareJson} readOnly />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
