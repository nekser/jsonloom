import type { Metadata } from "next";
import Link from "next/link";
import { APP_ROUTES } from "@/src/navigation/routes";

export const metadata: Metadata = {
  title: "About | JSON Transformation Tool",
  description: "What the JSON Transformation Tool does today and how to use it.",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-6 py-10 max-w-4xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">About</h1>
        <p className="text-muted-foreground">
          JSON Transformation Tool is a browser-based workspace for building repeatable data transformations with
          composable pipeline steps.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">What It Supports</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Source formats: JSON, YAML, and CSV.</li>
          <li>Pipeline operations across object, array, string, math, control-flow, validation, and date categories.</li>
          <li>Live preview, intermediate state inspection, and operation-level error reporting.</li>
          <li>Pipeline sharing via encoded URL and downloadable generated code.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Current Status</h2>
        <p className="text-sm text-muted-foreground">
          The tool is actively evolving. Documentation and tests are being expanded in parallel with feature work.
          Route scope is intentionally focused on core product pages.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Navigate</h2>
        <div className="flex gap-4 text-sm">
          <Link className="underline" href={APP_ROUTES.free}>Open Transformer</Link>
          <Link className="underline" href={APP_ROUTES.docs}>Read Docs</Link>
        </div>
      </section>
    </main>
  );
}
