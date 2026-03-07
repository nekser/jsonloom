export type DocsScreenshot = {
  src: string;
  alt: string;
  caption: string;
};

export const docsScreenshots: DocsScreenshot[] = [
  {
    src: "/docs/docs-source-panel.svg",
    alt: "Source panel editing JSON",
    caption: "Add JSON input and start shaping your payload.",
  },
  {
    src: "/docs/docs-operations-panel.svg",
    alt: "Operations panel with ordered pipeline steps",
    caption: "Add operations, reorder steps, and tune each config.",
  },
  {
    src: "/docs/docs-result-panel.svg",
    alt: "Result panel showing transformed output",
    caption: "See results instantly with output preview and runtime stats.",
  },
  {
    src: "/docs/docs-sharing-dialog.svg",
    alt: "Pipeline sharing and URL import flow",
    caption: "Share your pipeline link or import a saved one in seconds.",
  },
  {
    src: "/docs/docs-codegen-dialog.svg",
    alt: "Code generation dialog and language tabs",
    caption: "Generate ready-to-use code in your target language.",
  },
];
