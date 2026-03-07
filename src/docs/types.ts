import type { OperationType } from "@/src/operations";

export type OperationDocEntry = {
  type: OperationType;
  useCase: string;
  inputExample: string;
  configExample: string;
  outputExample: string;
  notes: string;
  demoLink: string;
};

export type DocsNavItem = {
  title: string;
  href: string;
};

export type DocsTocItem = {
  label: string;
  href: string;
};
