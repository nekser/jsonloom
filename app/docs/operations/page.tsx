import type { Metadata } from "next";
import OperationCard from "@/components/docs/OperationCard";
import DocsHero from "@/components/docs/DocsHero";
import { operationCatalog, type OperationCategory } from "@/src/operations/operationRegistry";
import { operationDocs } from "@/src/docs/operations-content";

export const metadata: Metadata = {
  title: "Operations | Docs",
  description: "Operation reference with use cases and runnable examples.",
};

const categoryOrder: OperationCategory[] = ["Object", "Array", "String", "Math", "Control", "Validation", "Date", "Other"];

function categoryId(category: OperationCategory): string {
  return `category-${category.toLowerCase()}`;
}

export default function OperationsDocsPage() {
  const grouped = operationCatalog.reduce<Record<OperationCategory, typeof operationCatalog>>((acc, op) => {
    if (!acc[op.category]) acc[op.category] = [];
    acc[op.category].push(op);
    return acc;
  }, {} as Record<OperationCategory, typeof operationCatalog>);

  return (
    <div className="space-y-8">
      <DocsHero
        title="Operation Catalog"
      />

      <section id="operation-catalog" className="space-y-8">
        {categoryOrder.map((category) => {
          const items = grouped[category] ?? [];
          if (items.length === 0) return null;
          return (
            <section key={category} id={categoryId(category)} className="space-y-4">
              <h2 className="text-2xl font-semibold">{category}</h2>
              <div className="grid gap-4">
                {items.map((op) => (
                  <OperationCard key={op.type} entry={operationDocs[op.type]} />
                ))}
              </div>
            </section>
          );
        })}

        <section id="extra" className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="text-2xl font-semibold">Extra</h2>
          <div id="write-result-to" className="space-y-2 text-sm">
            <h3 className="text-lg font-semibold">writeResultTo</h3>
            <p className="text-muted-foreground">
              When an operation exposes <code>writeResultTo</code>, you can write the computed value to a different JSON path instead of applying it in place.
              Leave it empty to keep in-place behavior.
            </p>
          </div>
        </section>
      </section>
    </div>
  );
}
