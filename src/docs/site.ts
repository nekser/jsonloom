import type { DocsNavItem, DocsTocItem } from "./types";
import { operationCatalog, type OperationCategory } from "@/src/operations/operationRegistry";
import { DOCS_AND_CODEGEN_ENABLED } from "@/src/config/features";

export const docsNavItems: DocsNavItem[] = [
  { title: "Overview", href: "/docs" },
  { title: "Getting Started", href: "/docs/getting-started" },
  { title: "Operations", href: "/docs/operations" },
  { title: "Sharing", href: "/docs/sharing" },
  ...(DOCS_AND_CODEGEN_ENABLED ? [{ title: "Code Generation", href: "/docs/codegen" }] : []),
  { title: "Troubleshooting", href: "/docs/troubleshooting" },
];

export const docsTocByPath: Record<string, DocsTocItem[]> = {
  "/docs": [
    { label: "What It Covers", href: "#what-it-covers" },
    { label: "Core Workflows", href: "#core-workflows" },
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
  ...(DOCS_AND_CODEGEN_ENABLED
    ? {
        "/docs/codegen": [
          { label: "Supported Targets", href: "#supported-targets" },
          { label: "Generation Contract", href: "#generation-contract" },
          { label: "Known Limits", href: "#known-limits" },
        ],
      }
    : {}),
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

  return [
    ...categoryOrder
      .filter((category) => usedCategories.has(category))
      .map((category) => ({
        label: category,
        href: `#category-${category.toLowerCase()}`,
      })),
    { label: "Extra", href: "#extra" },
  ];
}
