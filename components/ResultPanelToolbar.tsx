"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Download } from "lucide-react";
import { downloadText } from "../lib/io";
import type { JsonFormatMode } from "@/src/utils/jsonFormatting";

type Props = {
  text: string;
  formatMode: JsonFormatMode;
  onFormatModeChange: (mode: JsonFormatMode) => void;
};

export default function ResultPanelToolbar({ text, formatMode, onFormatModeChange }: Props) {
  const hasText = text.length > 0;

  const copy = async () => {
    if (!hasText) return;
    await navigator.clipboard.writeText(text);
  };
  const download = () => {
    if (!hasText) return;
    downloadText(`result-${ts()}.json`, text, "application/json");
  };
  const ts = () => new Date().toISOString().replace(/[:.]/g, "-");

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" aria-label="Format result JSON" className="h-8 cursor-pointer" disabled={!hasText}>
              Format
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Result format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={formatMode} onValueChange={(value) => onFormatModeChange(value as JsonFormatMode)}>
              <DropdownMenuRadioItem value="pretty">Beautify</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="minified">Minify</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Copy result" className="cursor-pointer" disabled={!hasText} onClick={copy}>
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy result</TooltipContent>
        </Tooltip>
         <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Download result" className="cursor-pointer" disabled={!hasText} onClick={download}>
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
