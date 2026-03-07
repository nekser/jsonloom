import type { Metadata } from "next";
import Link from "next/link";
import { operationCatalog, type OperationCategory } from "@/src/operations/operationRegistry";
import { APP_ROUTES } from "@/src/navigation/routes";

export const metadata: Metadata = {
  title: "Docs | JSON Transformation Tool",
  description: "Current capabilities and usage guide for the JSON Transformation Tool.",
};

const categoryOrder: OperationCategory[] = [
  "Object",
  "Array",
  "String",
  "Math",
  "Control",
  "Validation",
  "Date",
  "Other",
];

const codegenTargets = ["JavaScript", "TypeScript", "Python", "PHP", "Go", "jq"] as const;

export default function DocsPage() {
  const grouped = operationCatalog.reduce<Record<OperationCategory, typeof operationCatalog>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<OperationCategory, typeof operationCatalog>);

  return (
    <main className="container mx-auto px-6 py-10 max-w-5xl space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Documentation</h1>
        <p className="text-muted-foreground">
          Practical documentation for what the app supports today. Last updated: March 7, 2026.
        </p>
        <div className="flex gap-3 text-sm">
          <Link className="underline" href={APP_ROUTES.free}>Open Transformer</Link>
          <Link className="underline" href={APP_ROUTES.about}>About</Link>
        </div>
      </header>

      <section className="space-y-3" id="getting-started">
        <h2 className="text-2xl font-semibold">Getting Started</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Open <code>/free</code> and paste JSON in the Source panel.</li>
          <li>Use <code>Add step</code> to insert operations into the pipeline.</li>
          <li>Review live output in the Result panel and operation-level errors if any fail.</li>
          <li>Export or share pipelines from the toolbar and demo menu.</li>
        </ol>
      </section>

      <section className="space-y-3" id="formats">
        <h2 className="text-2xl font-semibold">Source Formats</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Input parsers: JSON, YAML, CSV.</li>
          <li>Result preview: normalized JSON output.</li>
          <li>Import from local files via Source toolbar upload (JSON).</li>
        </ul>
      </section>

      <section className="space-y-3" id="pipeline-model">
        <h2 className="text-2xl font-semibold">Pipeline Model</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Operations execute in order, top to bottom.</li>
          <li>Each operation can be enabled/disabled without deleting it.</li>
          <li>Nested pipelines are supported in <code>MapArray</code>, <code>If</code>, and <code>Switch</code>.</li>
          <li><code>writeResultTo</code> can route computed values to a different output path.</li>
          <li>Config interpolation supports <code>${"${...}"}</code> references resolved against runtime context.</li>
        </ul>
      </section>

      <section className="space-y-3" id="sharing">
        <h2 className="text-2xl font-semibold">Sharing And URL Hydration</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Shared URLs can include encoded <code>pipeline</code> and <code>data</code> query params.</li>
          <li>Opening a shared URL hydrates both operations and source JSON on load.</li>
          <li>Demo menu items use the same mechanism to open reproducible examples.</li>
        </ul>
      </section>

      <section className="space-y-3" id="codegen">
        <h2 className="text-2xl font-semibold">Code Generation</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Targets: {codegenTargets.join(", ")}.</li>
          <li>Generated code uses operation templates with TODO fallbacks for unsupported ops.</li>
          <li><code>jq</code> support is partial; unsupported operations are emitted as deterministic TODO comments.</li>
        </ul>
      </section>

      <section className="space-y-4" id="operations">
        <h2 className="text-2xl font-semibold">Operation Reference</h2>
        {categoryOrder.map((category) => {
          const items = grouped[category] ?? [];
          if (items.length === 0) return null;
          return (
            <div key={category} className="space-y-2">
              <h3 className="text-xl font-medium">{category}</h3>
              <ul className="space-y-1 text-sm">
                {items.map((item) => (
                  <li key={item.type}>
                    <code>{item.type}</code>: {item.description}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="space-y-3" id="troubleshooting">
        <h2 className="text-2xl font-semibold">Troubleshooting</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>If output is empty, check the Result panel error banner for operation id and message.</li>
          <li>Validate JSON source first; parser errors short-circuit pipeline execution.</li>
          <li>For large payloads, keep source under the in-app size guardrail and split heavy pipelines.</li>
          <li>Use demo URLs to verify expected behavior against known-good fixtures.</li>
        </ul>
      </section>
    </main>
  );
}
