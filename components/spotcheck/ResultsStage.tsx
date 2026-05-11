"use client";
import type { Sample, Segment } from "./types";
import { GhostButton, PrimaryButton, SegmentCard } from "./ui";

type Props = {
  sample: Sample;
  onReshoot: (segmentId: string) => void;
  onSkipReshoot: () => void;
};

export function ResultsStage({ sample, onReshoot, onSkipReshoot }: Props) {
  const passed = sample.segments.filter((s) => s.qaStatus === "PASSED");
  const failed = sample.segments.filter((s) => s.qaStatus === "FAILED");
  const review = sample.segments.filter((s) => s.qaStatus === "NEEDS_REVIEW");

  const requiredFound = sample.requiredCategories.map((req) => {
    const seg = sample.segments.find(
      (s) => s.rawCategory.toLowerCase() === req.toLowerCase(),
    );
    return { name: req, segment: seg };
  });
  const missing = requiredFound.filter((r) => !r.segment);

  const reshootCandidate = review[0] ?? failed[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
          Stage 3 · QA results
        </div>
        <p className="text-sm text-[var(--muted)] max-w-3xl">
          Pilot-facing summary. The point of this view is the reshoot decision before the route
          moves: missing or weak capture is visible right now, not 24 hours after manual sort and
          upload.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SummaryStat label="Passed" count={passed.length} tone="good" />
        <SummaryStat label="Failed" count={failed.length} tone="bad" />
        <SummaryStat label="Needs review" count={review.length} tone="warn" />
      </div>

      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] mb-2">
          Required flights for this site
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          {requiredFound.map(({ name, segment }) => (
            <RequiredRow key={name} name={name} segment={segment} />
          ))}
        </div>
        {missing.length > 0 && (
          <div className="mt-3 text-xs text-[var(--bad)]">
            {missing.length} required flight{missing.length === 1 ? "" : "s"} not detected.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
          All segments
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {sample.segments.map((seg) => (
            <SegmentCard key={seg.id} segment={seg} compact />
          ))}
        </div>
      </div>

      {reshootCandidate ? (
        <div className="rounded-md border border-[var(--warn)]/40 bg-[var(--warn)]/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">
              Reshoot opportunity: <span className="font-mono">{reshootCandidate.category}</span>
            </div>
            <div className="text-xs text-[var(--muted)] max-w-xl">
              The pilot is still on site. Flag this segment for a quick re-fly with the gimbal
              repointed, then run the QA pass again.
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <GhostButton onClick={onSkipReshoot}>Skip — submit as-is</GhostButton>
            <PrimaryButton onClick={() => onReshoot(reshootCandidate.id)}>
              Mark for reshoot →
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <PrimaryButton onClick={onSkipReshoot}>Submit and queue upload →</PrimaryButton>
        </div>
      )}

      <UploadQueueStrip sample={sample} />
    </div>
  );
}

function SummaryStat({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "good" | "bad" | "warn";
}) {
  const colors: Record<typeof tone, string> = {
    good: "text-[var(--good)]",
    bad: "text-[var(--bad)]",
    warn: "text-[var(--warn)]",
  };
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{label}</div>
      <div className={`text-3xl font-mono mt-1 ${colors[tone]}`}>{count}</div>
    </div>
  );
}

function RequiredRow({ name, segment }: { name: string; segment: Segment | undefined }) {
  const ok = !!segment;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        aria-hidden
        className={`inline-block w-2.5 h-2.5 rounded-full ${
          ok ? "bg-[var(--good)]" : "bg-[var(--bad)]"
        }`}
      />
      <span className={ok ? "" : "text-[var(--muted)] line-through"}>{name}</span>
      {segment && (
        <span className="text-[var(--muted)] font-mono ml-auto">{segment.photoCount}</span>
      )}
    </div>
  );
}

function UploadQueueStrip({ sample }: { sample: Sample }) {
  const totalMb = Math.round((sample.photoCount * 8.5 * 10) / 10); // ~8.5MB per photo
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel-2)] p-3 flex items-center gap-3 flex-wrap">
      <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
        Deferred upload queue
      </span>
      <span className="text-xs font-mono">
        {sample.photoCount} files · ~{totalMb} MB
      </span>
      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--border)] text-[var(--muted)]">
        queued — awaiting connection
      </span>
      <span className="text-[11px] text-[var(--muted)] ml-auto">
        QA already ran. Full upload moves later from a better connection.
      </span>
    </div>
  );
}
