import type { OperationDocEntry } from "@/src/docs/types";
import ExamplePair from "./ExamplePair";
import DemoLinkCard from "./DemoLinkCard";

export default function OperationCard({ entry }: { entry: OperationDocEntry }) {
  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm md:p-5">
      <header>
        <h3 className="text-lg font-semibold">{entry.type}</h3>
      </header>
      <p className="text-sm text-muted-foreground">{entry.useCase}</p>
      <ExamplePair input={entry.inputExample} config={entry.configExample} output={entry.outputExample} />
      <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">{entry.notes}</div>
      <DemoLinkCard title={`${entry.type} demo`} description="Runnable one-step pipeline preloaded in /free." href={entry.demoLink} />
    </article>
  );
}
