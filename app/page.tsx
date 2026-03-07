import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Transform JSON & Beyond — Fast, Simple, Free</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Built for developers and data wranglers who need clean, repeatable transformations.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Button asChild size="lg"><Link href="/free">Try Free Transformer</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/free">Get Started</Link></Button>
        </div>
      </section>

      {/* Product Story */}
      <section className="container mx-auto px-6 py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl font-semibold">Tame messy data with pipelines</h2>
          <p className="text-muted-foreground mt-2">
            Stop rewriting the same scripts. Use the free JSON Transformer to format, validate, and convert your data.
            Coming soon: a SaaS pipeline to save, share, and run transformations via API.
          </p>
        </div>
        <div>
          <Card className="p-6 shadow-sm">
            <div className="text-sm text-muted-foreground">
              Visual operations in the middle. JSON in, JSON out. Instant preview.
            </div>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-sm">
            <h3 className="font-semibold">Free JSON Transformer</h3>
            <p className="text-sm text-muted-foreground mt-2">Format, validate, and convert JSON/YAML/CSV.</p>
            <div className="mt-3"><Link className="underline text-primary" href="/free">Open tool →</Link></div>
          </Card>
          <Card className="p-6 shadow-sm">
            <h3 className="font-semibold">Operations Pipelines</h3>
            <p className="text-sm text-muted-foreground mt-2">Compose multiple transformations and preview instantly.</p>
          </Card>
          <Card className="p-6 shadow-sm">
            <h3 className="font-semibold">Future SaaS Features</h3>
            <p className="text-sm text-muted-foreground mt-2">Run via API and save pipelines (coming soon).</p>
          </Card>
        </div>
      </section>

      {/* Mid CTA */}
      <section className="container mx-auto px-6 py-16 text-center">
        <Card className="p-8 shadow-sm">
          <h3 className="text-xl font-semibold">Start transforming JSON now — free, no signup required</h3>
          <div className="mt-4"><Button asChild size="lg"><Link href="/free">Open the Free Transformer</Link></Button></div>
        </Card>
      </section>
    </div>
  );
}
