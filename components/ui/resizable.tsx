"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      className={cn("flex h-full w-full data-[orientation=vertical]:flex-col", className)}
      {...props}
    />
  );
}

function ResizablePanel(props: React.ComponentProps<typeof Panel>) {
  return <Panel {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) {
  return (
    <Separator
      className={cn(
        "relative flex w-1 items-center justify-center bg-border/70 transition-colors hover:bg-border",
        "after:absolute after:inset-y-0 after:left-[-6px] after:right-[-6px] after:content-['']",
        "data-[orientation=vertical]:h-1 data-[orientation=vertical]:w-full",
        "data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:right-0",
        "data-[orientation=vertical]:after:top-[-6px] data-[orientation=vertical]:after:bottom-[-6px]",
        className
      )}
      {...props}
    >
      {withHandle ? (
        <div className="z-10 flex h-7 w-4 items-center justify-center rounded-sm border bg-background">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      ) : null}
    </Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
