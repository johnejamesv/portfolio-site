"use client";
import { useMemo, useState } from "react";
import type { Segment, SegmentDiff, Submission } from "./types";
import { GhostButton, StatusBadge, VersionBadge } from "./ui";

type Props = {
  submissions: Submission[];
  onReset: () => void;
};

export function DiffStage({ submissions, onReset }: Props) {
  const [activeSeq, setActiveSeq] = useState(submissions[submissions.length - 1].sequenceNumber);
  const active = submissions.find((s) => s.sequenceNumber === activeSeq) ?? submissions[submissions.length - 1];
  const prev = submissions.find((s) => s.sequenceNumber === activeSeq - 1);

  const diffs: SegmentDiff[] = useMemo(() => computeDiff(prev, active), [prev, active]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
          Stage 4 · Submission timeline
        </div>
        <p className="text-sm text-[var(--muted)] max-w-3xl">
          Every QA pass is a submission. Re-flights become a new version on the affected flight,
          not a new site — so the diff stays focused on what actually changed. This is the same
          shape SpotCheck&apos;s submissions API exposes.
        </p>
      </div>

      <Timeline submissions={submissions} activeSeq={activeSeq} onSelect={setActiveSeq} />

      <div className="flex flex-col gap-2">
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
          Diff vs. previous submission
        </div>
        {prev ? (
          <div className="flex flex-col gap-2">
            {diffs.map((d) => (
              <DiffRow key={d.category} diff={d} />
            ))}
          </div>
        ) : (
          <div className="text-xs text-[var(--muted)]">Initial upload — nothing to diff against.</div>
        )}
      </div>

      <div className="flex justify-end">
        <GhostButton onClick={onReset}>Reset demo</GhostButton>
      </div>
    </div>
  );
}

function Timeline({
  submissions,
  activeSeq,
  onSelect,
}: {
  submissions: Submission[];
  activeSeq: number;
  onSelect: (seq: number) => void;
}) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 flex flex-col gap-1">
      {submissions.map((s) => {
        const active = s.sequenceNumber === activeSeq;
        return (
          <button
            key={s.sequenceNumber}
            onClick={() => onSelect(s.sequenceNumber)}
            className={`text-left px-3 py-2 rounded text-xs flex items-center gap-3 border ${
              active
                ? "border-[var(--accent)] bg-[var(--panel-2)]"
                : "border-transparent hover:bg-[var(--panel-2)]"
            }`}
          >
            <span className="font-mono text-[var(--muted)]">#{s.sequenceNumber}</span>
            <span className="font-medium">{s.message}</span>
            <SourceTag source={s.source} />
            <span className="ml-auto font-mono text-[var(--muted)]">
              {new Date(s.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SourceTag({ source }: { source: Submission["source"] }) {
  const styles: Record<Submission["source"], string> = {
    upload: "border-[var(--border)] text-[var(--muted)]",
    correction: "border-[var(--warn)]/40 text-[var(--warn)]",
    qc_review: "border-[var(--bad)]/40 text-[var(--bad)]",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${styles[source]}`}
    >
      {source.replace("_", " ")}
    </span>
  );
}

function DiffRow({ diff }: { diff: SegmentDiff }) {
  const tone =
    diff.status === "replaced"
      ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
      : diff.status === "added"
      ? "border-[var(--good)]/40 bg-[var(--good)]/5"
      : diff.status === "removed"
      ? "border-[var(--bad)]/40 bg-[var(--bad)]/5"
      : "border-[var(--border)]";
  return (
    <div className={`rounded-md border ${tone} p-3 flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-mono">
          {diff.status}
        </span>
        <span className="text-sm font-medium">{diff.category}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <DiffCell label="before" segment={diff.before} />
        <DiffCell label="after" segment={diff.after} />
      </div>
    </div>
  );
}

function DiffCell({ label, segment }: { label: string; segment: Segment | null }) {
  if (!segment) {
    return (
      <div className="rounded border border-dashed border-[var(--border)] p-3 text-xs text-[var(--muted)] italic">
        — not present in this submission —
        <div className="text-[10px] mt-1 not-italic">{label}</div>
      </div>
    );
  }
  return (
    <div className="rounded border border-[var(--border)] bg-[var(--panel)] p-3">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{label}</span>
          {segment.version !== undefined && <VersionBadge version={segment.version} />}
        </div>
        <StatusBadge status={segment.qaStatus} />
      </div>
      <div className="text-xs font-mono text-[var(--muted)]">
        {segment.photoCount} photos · pitch {segment.medianPitch.toFixed(1)}° · alt{" "}
        {segment.medianAltitude.toFixed(0)}m
        {segment.totalRotation !== null ? ` · rot ${segment.totalRotation.toFixed(0)}°` : ""}
      </div>
      {segment.note && <div className="text-[11px] text-[var(--muted)] mt-2">{segment.note}</div>}
    </div>
  );
}

function computeDiff(prev: Submission | undefined, curr: Submission): SegmentDiff[] {
  if (!prev) {
    return curr.segments.map((s) => ({
      category: s.category,
      status: "added" as const,
      before: null,
      after: s,
    }));
  }
  const byCat = new Map<string, { before?: Segment; after?: Segment }>();
  for (const s of prev.segments) byCat.set(s.category, { before: s });
  for (const s of curr.segments) {
    const entry = byCat.get(s.category) ?? {};
    entry.after = s;
    byCat.set(s.category, entry);
  }
  const out: SegmentDiff[] = [];
  byCat.forEach(({ before, after }, category) => {
    if (before && after) {
      const replaced = before.id !== after.id || before.qaStatus !== after.qaStatus;
      out.push({
        category,
        status: replaced ? "replaced" : "unchanged",
        before,
        after,
      });
    } else if (after) {
      out.push({ category, status: "added", before: null, after });
    } else if (before) {
      out.push({ category, status: "removed", before, after: null });
    }
  });
  return out;
}
