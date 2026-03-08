import type { ComponentType } from "react";
import DocsHero from "@/components/docs/DocsHero";
import Callout from "@/components/docs/Callout";
import StepList from "@/components/docs/StepList";
import ScreenshotFigure from "@/components/docs/ScreenshotFigure";
import DemoLinkCard from "@/components/docs/DemoLinkCard";

type MDXComponents = Record<string, ComponentType<Record<string, unknown>>>;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className="text-3xl font-semibold tracking-tight" {...props} />,
    h2: (props) => <h2 className="mt-8 text-2xl font-semibold tracking-tight" {...props} />,
    h3: (props) => <h3 className="mt-5 text-xl font-semibold" {...props} />,
    p: (props) => <p className="mt-3 text-sm leading-7 text-muted-foreground" {...props} />,
    ul: (props) => <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground" {...props} />,
    ol: (props) => <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground" {...props} />,
    li: (props) => <li className="leading-6" {...props} />,
    a: (props) => <a className="text-primary underline" {...props} />,
    code: (props) => <code className="rounded bg-muted px-1 py-0.5 text-xs" {...props} />,
    pre: (props) => <pre className="mt-3 overflow-auto rounded-xl border bg-card p-3 text-xs" {...props} />,
    DocsHero: DocsHero as ComponentType<Record<string, unknown>>,
    Callout: Callout as ComponentType<Record<string, unknown>>,
    StepList: StepList as ComponentType<Record<string, unknown>>,
    ScreenshotFigure: ScreenshotFigure as ComponentType<Record<string, unknown>>,
    DemoLinkCard: DemoLinkCard as ComponentType<Record<string, unknown>>,
    ...components,
  };
}
