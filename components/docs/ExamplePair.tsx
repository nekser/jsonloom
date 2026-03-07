"use client";

import { useState } from "react";

export default function ExamplePair({ input, config, output }: { input: string; config: string; output: string }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
      <ExampleBlock title="Input" body={input} />
      <ExampleBlock title="Config" body={config} />
      <ExampleBlock title="Output" body={output} />
    </div>
  );
}

function ExampleBlock({ title, body }: { title: string; body: string }) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = body.length > 280 || body.split("\n").length > 10;

  return (
    <section className="rounded-xl border bg-background shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b px-3 py-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
        {canExpand ? (
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        ) : null}
      </header>
      <pre className={`overflow-auto p-3 text-sm leading-relaxed ${expanded ? "max-h-none" : "max-h-64"}`}>{body}</pre>
    </section>
  );
}
