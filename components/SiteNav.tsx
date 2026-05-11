"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/70 bg-[var(--background)]/95">
      <div className="px-5 md:px-10 min-h-16 py-3 flex items-center justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--panel)]/80 px-1.5 py-1.5 shadow-sm">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  active
                    ? "bg-[var(--panel-2)] text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
