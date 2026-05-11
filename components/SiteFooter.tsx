import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-5 md:px-10 py-10 flex flex-col items-center gap-5">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            Work
          </Link>
          <span aria-hidden>·</span>
          <Link href="/about" className="hover:text-[var(--foreground)] transition-colors">
            About
          </Link>
          <span aria-hidden>·</span>
          <a
            href="mailto:john.james9007@gmail.com"
            className="hover:text-[var(--foreground)] transition-colors"
          >
            john.james9007@gmail.com
          </a>
        </div>

        <p className="text-[10px] font-mono text-[var(--muted)]/70 tracking-wider">
          © 2026 John E James V · Kanagawa, Japan
        </p>
      </div>
    </footer>
  );
}
