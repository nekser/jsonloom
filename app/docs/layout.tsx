import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import DocsShell from "@/components/docs/DocsShell";
import { DOCS_AND_CODEGEN_ENABLED } from "@/src/config/features";

export default function DocsLayout({ children }: { children: ReactNode }) {
  if (!DOCS_AND_CODEGEN_ENABLED) {
    notFound();
  }
  return <DocsShell>{children}</DocsShell>;
}
