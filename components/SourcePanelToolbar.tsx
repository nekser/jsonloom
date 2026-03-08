"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload } from "lucide-react";
import { formatJsonText, isTextWithinByteLimit, SOURCE_MAX_BYTES, type JsonFormatMode } from "@/src/utils/jsonFormatting";
import { State, useOpsStore } from "../src/store/operations";

export default function SourcePanelToolbar() {
  const sourceText = useOpsStore((s: State) => s.sourceText);
  const sourceError = useOpsStore((s: State) => s.sourceError);
  const setSourceText = useOpsStore((s: State) => s.setSourceText);
  const canFormat = !sourceError;

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

  const formatSource = (mode: JsonFormatMode) => {
    if (!canFormat) return;
    const formatted = formatJsonText(sourceText, mode);
    if (!formatted.ok) return;
    if (!isTextWithinByteLimit(formatted.text, SOURCE_MAX_BYTES)) return;
    setSourceText(formatted.text);
  };

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Format source JSON" className="h-8 cursor-pointer" disabled={!canFormat}>
            Format
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={!canFormat} onClick={() => formatSource("pretty")}>
            Beautify
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!canFormat} onClick={() => formatSource("minified")}>
            Minify
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Upload" className="cursor-pointer" onClick={upload}>
            <Upload className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Upload</TooltipContent>
      </Tooltip>
    </div>
  );
}
