export default function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-l-4 border-primary bg-muted/40 p-4">
      <div className="mb-1 text-sm font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
