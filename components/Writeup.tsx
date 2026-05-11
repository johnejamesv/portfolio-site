import type { ReactNode } from "react";

export function Writeup({ children }: { children: ReactNode }) {
  return (
    <section className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-5 md:px-10 py-16 flex flex-col gap-12">
        {children}
      </div>
    </section>
  );
}

export function WriteupHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="flex flex-col gap-3">
      <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
        {eyebrow}
      </span>
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="text-base text-[var(--muted)] max-w-2xl leading-relaxed">{lede}</p>
    </header>
  );
}

export function WriteupSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-mono text-[var(--accent-2)] uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex flex-col gap-3 text-sm md:text-base leading-relaxed text-[var(--foreground)]/90">
        {children}
      </div>
    </div>
  );
}

export function WriteupTwoCol({
  left,
  right,
}: {
  left: { title: string; items: string[] };
  right: { title: string; items: string[] };
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <WriteupColumn title={left.title} items={left.items} />
      <WriteupColumn title={right.title} items={right.items} />
    </div>
  );
}

function WriteupColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 flex flex-col gap-3">
      <h4 className="text-xs font-mono text-[var(--accent-2)] uppercase tracking-wider">
        {title}
      </h4>
      <ul className="flex flex-col gap-2 text-sm text-[var(--foreground)]/85 leading-relaxed">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[var(--muted)] shrink-0">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProofGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-md border border-[var(--border)] bg-[var(--panel-2)] p-3 flex flex-col gap-1"
        >
          <div className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">
            {item.label}
          </div>
          <div className="text-sm font-mono">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function StackList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className="text-xs font-mono px-2 py-1 rounded border border-[var(--border)] bg-[var(--panel-2)] text-[var(--muted)]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
