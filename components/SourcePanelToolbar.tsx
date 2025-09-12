"use client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload } from "lucide-react";
import { useOpsStore, State } from "../store/operations";

export default function SourcePanelToolbar() {
  const setSourceText = useOpsStore((s: State) => s.setSourceText);

  const upload = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json,application/json";
    inp.onchange = async () => {
      const file = inp.files?.[0];
      if (!file) return;
      const text = await file.text();
      setSourceText(text);
    };
    inp.click();
  };

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Upload JSON" onClick={upload}>
            <Upload className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Upload JSON</TooltipContent>
      </Tooltip>
    </div>
  );
}
