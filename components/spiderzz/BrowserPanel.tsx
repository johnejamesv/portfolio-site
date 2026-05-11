import { ReactNode } from "react";

export function BrowserPanel({
  url,
  title,
  children,
  active = true,
}: {
  url: string;
  title: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-lg border border-[var(--border)] bg-[var(--panel)] overflow-hidden shadow-md transition-opacity ${
        active ? "opacity-100" : "opacity-30 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--panel-2)]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ef5b5b]" />
          <span className="w-3 h-3 rounded-full bg-[#f1c34a]" />
          <span className="w-3 h-3 rounded-full bg-[#5ec27c]" />
        </div>
        <div className="flex-1 mx-3 px-3 py-1 rounded bg-[var(--panel)] text-xs text-[var(--muted)] border border-[var(--border)] truncate">
          {url}
        </div>
        <div className="text-xs text-[var(--muted)]">{title}</div>
      </div>
      <div className="flex-1 min-h-[420px]">{children}</div>
    </div>
  );
}
