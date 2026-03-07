import Link from "next/link";

export default function DemoLinkCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <Link href={href} className="mt-3 inline-flex text-xs font-medium text-primary underline">
        Open runnable example
      </Link>
    </div>
  );
}
