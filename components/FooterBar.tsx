import Link from "next/link";

export default function FooterBar() {
  return (
    <footer className="h-12 px-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 bg-neutral-50/50 dark:bg-neutral-900/30">
      <div>© {new Date().getFullYear()} YourApp</div>
      <nav className="flex items-center gap-4">
        <Link href="/docs" className="hover:underline">Docs</Link>
        <Link href="/contact" className="hover:underline">Contact</Link>
        <Link href="/legal" className="hover:underline">Privacy</Link>
      </nav>
    </footer>
  );
}
