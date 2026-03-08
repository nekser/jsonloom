"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { operationHelperByType } from "@/src/docs/operation-helpers";
import type { OperationType } from "@/src/operations";
import { CircleHelp } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  operationType: OperationType;
};

export default function OperationHelperDialog({ operationType }: Props) {
  const [open, setOpen] = useState(false);

  const helper = useMemo(
    () =>
      operationHelperByType[operationType] ?? {
        excerpt: "No helper documentation is currently available for this operation.",
        configFields: [{ label: "Settings", value: "No additional settings." }],
        outputExample: "{}",
      },
    [operationType]
  );

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer"
            aria-label={`Open helper for ${operationType}`}
            onClick={() => setOpen(true)}
          >
            <CircleHelp />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Helper</TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{operationType} helper</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <section>
              <p className="text-muted-foreground">{helper.excerpt}</p>
            </section>

            <section className="space-y-2">
              <h4 className="font-medium">Config example</h4>
              <dl className="space-y-2 rounded-md border bg-muted/30 p-2">
                {helper.configFields.map((field) => (
                  <div key={`${field.label}-${field.value}`} className="grid grid-cols-[minmax(140px,auto)_1fr] gap-2 text-xs">
                    <dt className="font-medium text-foreground">{field.label}</dt>
                    <dd className="text-muted-foreground">{field.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="space-y-2">
              <h4 className="font-medium">Expected output</h4>
              <pre className="max-h-40 overflow-auto rounded-md border bg-muted/30 p-2 text-xs whitespace-pre-wrap">{helper.outputExample}</pre>
            </section>

            {helper.notes ? (
              <section className="space-y-2">
                <h4 className="font-medium">Notes</h4>
                <p className="text-muted-foreground">{helper.notes}</p>
              </section>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
