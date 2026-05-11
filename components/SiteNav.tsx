"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
];

const profileLinks = [
  {
    href: "https://github.com/johnejamesv",
    label: "GitHub",
    icon: <GitHubIcon />,
  },
  {
    href: "https://leetcode.com/u/jUzKCxzUXj/",
    label: "LeetCode",
    icon: <LeetCodeIcon />,
  },
  {
    href: "https://www.linkedin.com/in/john-james-052212117/",
    label: "LinkedIn",
    icon: <LinkedInIcon />,
  },
  {
    href: "https://www.kaggle.com/johnjamesv",
    label: "Kaggle",
    icon: <KaggleIcon />,
  },
  {
    href: "mailto:john.james9007@gmail.com",
    label: "Email",
    icon: <EmailIcon />,
  },
];

export function SiteNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/70 bg-[var(--background)]/95">
      <div className="px-5 md:px-10 min-h-16 py-3 flex flex-wrap items-center justify-center gap-2">
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
        <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--panel)]/80 px-1.5 py-1.5 shadow-sm">
          {profileLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-label={link.label}
              title={link.label}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="grid h-8 w-8 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--panel-2)] hover:text-[var(--foreground)] transition-colors"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LeetCodeIcon() {
  return (
    <span className="font-mono text-[11px] font-semibold leading-none" aria-hidden>
      LC
    </span>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.68H9.34V8.99h3.42v1.57h.05c.48-.91 1.64-1.86 3.37-1.86 3.61 0 4.27 2.37 4.27 5.46v6.29ZM5.32 7.42a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.03H3.54V8.99H7.1v11.46ZM22.23 0H1.76C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.76 24h20.47c.97 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0Z" />
    </svg>
  );
}

function KaggleIcon() {
  return (
    <span className="font-mono text-xs font-semibold leading-none" aria-hidden>
      K
    </span>
  );
}

function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
