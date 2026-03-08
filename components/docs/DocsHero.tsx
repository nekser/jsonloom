import Link from "next/link";

type DocsHeroProps = {
  title: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function DocsHero({ title, subtitle, ctaHref, ctaLabel }: DocsHeroProps) {
  const cta = ctaHref && ctaLabel ? { href: ctaHref, label: ctaLabel } : null;

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm md:p-8">
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
      {subtitle ? <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">{subtitle}</p> : null}
      {cta ? (
        <div className="mt-5">
          <Link href={cta.href} className="inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">
            {cta.label}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
