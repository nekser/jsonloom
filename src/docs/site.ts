import type { DocsNavItem, DocsTocItem } from "./types";
import { operationCatalog, type OperationCategory } from "@/src/operations/operationRegistry";

export const docsNavItems: DocsNavItem[] = [
  { title: "Overview", href: "/docs" },
  { title: "Getting Started", href: "/docs/getting-started" },
  { title: "Operations", href: "/docs/operations" },
  { title: "Sharing", href: "/docs/sharing" },
  { title: "Code Generation", href: "/docs/codegen" },
  { title: "Troubleshooting", href: "/docs/troubleshooting" },
];

export const docsTocByPath: Record<string, DocsTocItem[]> = {
  "/docs": [
    { label: "What It Covers", href: "#what-it-covers" },
    { label: "Core Workflows", href: "#core-workflows" },
    { label: "Visual Tour", href: "#visual-tour" },
  ],
  "/docs/getting-started": [
    { label: "Quick Start", href: "#quick-start" },
    { label: "Source Formats", href: "#source-formats" },
    { label: "Pipeline Runtime", href: "#pipeline-runtime" },
  ],
  "/docs/operations": buildOperationsCategoryToc(),
  "/docs/sharing": [
    { label: "Share Links", href: "#share-links" },
    { label: "Demo Links", href: "#demo-links" },
    { label: "Import/Export", href: "#import-export" },
  ],
  "/docs/codegen": [
    { label: "Supported Targets", href: "#supported-targets" },
    { label: "Generation Contract", href: "#generation-contract" },
    { label: "Known Limits", href: "#known-limits" },
  ],
  "/docs/troubleshooting": [
    { label: "Pipeline Errors", href: "#pipeline-errors" },
    { label: "Validation", href: "#validation" },
    { label: "Performance", href: "#performance" },
  ],
};

export function docsTocForPath(pathname: string): DocsTocItem[] {
  return docsTocByPath[pathname] ?? [];
}

function buildOperationsCategoryToc(): DocsTocItem[] {
  const categoryOrder: OperationCategory[] = ["Object", "Array", "String", "Math", "Control", "Validation", "Date", "Other"];
  const usedCategories = new Set(operationCatalog.map((op) => op.category));

  return categoryOrder
    .filter((category) => usedCategories.has(category))
    .map((category) => ({
      label: category,
      href: `#category-${category.toLowerCase()}`,
    }));
}
