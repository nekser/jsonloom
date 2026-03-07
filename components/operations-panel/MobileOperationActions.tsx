import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  opId: string;
  index: number;
  opCount: number;
  isEnabled: boolean;
  hasErr?: string;
  interText?: string;
  onToggleEnabled: (enabled: boolean) => void;
  onMove: (from: number, to: number) => void;
  onDelete: () => void;
};

export default function MobileOperationActions({
  opId,
  index,
  opCount,
  isEnabled,
  hasErr,
  interText,
  onToggleEnabled,
  onMove,
  onDelete,
}: Props) {
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [mobileResultOpen, setMobileResultOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setMobileActionsOpen(true)}>
        <Eye />
      </Button>
      <Sheet open={mobileActionsOpen} onOpenChange={setMobileActionsOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Actions</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 px-2 pb-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Label htmlFor={`op-enable-mobile-${opId}`}>{isEnabled ? "Disable" : "Enable"}</Label>
              </div>
              <Switch id={`op-enable-mobile-${opId}`} checked={isEnabled} onCheckedChange={onToggleEnabled} />
            </div>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setMobileActionsOpen(false);
                setMobileResultOpen(true);
              }}
            >
              <Eye />
              View Result
            </Button>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={index <= 0}
                onClick={() => index > 0 && onMove(index, index - 1)}
              >
                <ArrowUp />
                Move Up
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={index >= opCount - 1}
                onClick={() => index < opCount - 1 && onMove(index, index + 1)}
              >
                <ArrowDown />
                Move Down
              </Button>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    onDelete();
                    setMobileActionsOpen(false);
                  }}
                >
                  <Trash2 />
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete operation</TooltipContent>
            </Tooltip>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={mobileResultOpen} onOpenChange={setMobileResultOpen}>
        <DialogContent className="max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Intermediate Result</DialogTitle>
          </DialogHeader>
          {hasErr ? (
            <div className="text-xs text-red-700 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-2">{hasErr}</div>
          ) : (
            <div className="text-xs">
              <pre className="overflow-auto max-h-[70vh] whitespace-pre-wrap">{interText ?? ""}</pre>
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <Button variant="outline" size="sm" onClick={async () => navigator.clipboard.writeText(String(interText ?? ""))}>
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
