import type { QaStatus, Segment } from "./types";

export function StatusBadge({ status }: { status: QaStatus }) {
  const styles: Record<QaStatus, string> = {
    PASSED: "bg-[color:var(--good)]/15 text-[color:var(--good)] border-[color:var(--good)]/40",
    FAILED: "bg-[color:var(--bad)]/15 text-[color:var(--bad)] border-[color:var(--bad)]/40",
    NEEDS_REVIEW: "bg-[color:var(--warn)]/15 text-[color:var(--warn)] border-[color:var(--warn)]/40",
  };
  const label: Record<QaStatus, string> = {
    PASSED: "Pass",
    FAILED: "Fail",
    NEEDS_REVIEW: "Review",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${styles[status]}`}
    >
      {label[status]}
    </span>
  );
}

export function VersionBadge({ version }: { version: number }) {
  return (
    <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--panel-2)] text-[var(--muted)]">
      v{version}
    </span>
  );
}

export function MetricGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
      {items.map((it) => (
        <div
          key={it.label}
          className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--panel-2)]"
        >
          <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{it.label}</div>
          <div className="text-sm font-mono">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

type SegmentCardProps = {
  segment: Segment;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
};

export function SegmentCard({ segment, selected, onClick, compact }: SegmentCardProps) {
  const Wrapper: "button" | "div" = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`text-left w-full rounded-md border bg-[var(--panel)] p-3 transition-colors ${
        selected
          ? "border-[var(--accent)]"
          : "border-[var(--border)] hover:border-[var(--accent-2)]/60"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">{segment.category}</span>
            {segment.version !== undefined && <VersionBadge version={segment.version} />}
          </div>
          <span className="text-[10px] font-mono text-[var(--muted)]">
            {segment.photoCount} photos · pitch {segment.medianPitch.toFixed(1)}° · alt{" "}
            {segment.medianAltitude.toFixed(0)}m
            {segment.totalRotation !== null ? ` · rot ${segment.totalRotation.toFixed(0)}°` : ""}
          </span>
        </div>
        <StatusBadge status={segment.qaStatus} />
      </div>
      {!compact && (
        <p className="mt-2 text-[11px] font-mono text-[var(--muted)] leading-snug">
          {segment.rule}
        </p>
      )}
    </Wrapper>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-2)] disabled:bg-[var(--border)] disabled:text-[var(--muted)] disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-md border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent-2)] transition-colors"
    >
      {children}
    </button>
  );
}
