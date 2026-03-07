"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ScreenshotFigure({
  src,
  alt,
  caption,
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  caption: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <figure className={cn("rounded-xl border bg-card p-3 shadow-sm", className)}>
      <figcaption className="mb-2 text-sm font-medium text-foreground">{caption}</figcaption>

      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group block w-full overflow-hidden rounded-lg border bg-muted/20 text-left"
            aria-label={`Open full screenshot: ${alt}`}
          >
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={700}
              className={cn("h-auto w-full transition-opacity group-hover:opacity-95", imageClassName)}
            />
            <span className="block border-t px-3 py-2 text-xs text-muted-foreground">Click to expand</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[92vh] w-[96vw] max-w-[1400px] p-3 sm:p-4">
          <DialogTitle className="text-base">{alt}</DialogTitle>
          <DialogDescription className="text-xs">{caption}</DialogDescription>
          <div className="max-h-[78vh] overflow-auto rounded-md border bg-muted/20 p-1">
            <Image src={src} alt={alt} width={1800} height={1000} className="h-auto w-full object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </figure>
  );
}
