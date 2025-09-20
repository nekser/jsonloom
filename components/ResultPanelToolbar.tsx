"use client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Download } from "lucide-react";
import { downloadText } from "../lib/io";
import { State, useOpsStore } from "../src/store/operations";

export default function ResultPanelToolbar() {
  const resultText = useOpsStore((s: State) => s.resultText);

  const copy = async () => {
    await navigator.clipboard.writeText(resultText);
  };
  const download = () => {
    const txt = resultText || "";
    downloadText(`result-${ts()}.json`, txt, "application/json");
  };
  const ts = () => new Date().toISOString().replace(/[:.]/g, "-");

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Copy result" onClick={copy}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy result</TooltipContent>
        </Tooltip>
         <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Copy result" onClick={download}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export resuilt</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
