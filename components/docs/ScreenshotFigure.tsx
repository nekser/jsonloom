import Image from "next/image";
import { cn } from "@/lib/utils";

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
    <figure className={cn("mx-auto w-full max-w-5xl rounded-xl border bg-card p-3 shadow-sm", className)}>
      <figcaption className="mb-2 text-sm font-medium text-foreground">{caption}</figcaption>
      <div className="overflow-hidden rounded-lg border bg-muted/20">
        <span className="block h-[280px] sm:h-[330px] lg:h-[380px]">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={700}
            className={cn("h-full w-full object-contain", imageClassName)}
          />
        </span>
      </div>
    </figure>
  );
}
