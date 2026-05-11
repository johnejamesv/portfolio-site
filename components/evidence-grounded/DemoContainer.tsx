"use client";

import { useMemo, useState } from "react";
import {
  bullets,
  decisions,
  evidenceItems,
  findings,
  requirements,
  sources,
} from "./fixtures";
import type { Stage, Strength } from "./types";

const STAGES: { id: Stage; label: string; caption: string }[] = [
  {
    id: "input",
    label: "1. Input",
    caption:
      "Start from inspectable source material — candidate notes plus a target role — instead of a blank prompt.",
  },
  {
    id: "evidence",
    label: "2. Evidence",
    caption:
      "Normalize messy source text into atomic EvidenceItem records that carry their original excerpt.",
  },
  {
    id: "coverage",
    label: "3. Coverage map",
    caption:
      "Each role requirement is rated strong, weak, adjacent, or missing — not silently filled in.",
  },
  {
    id: "bullets",
    label: "4. Drafted bullets",
    caption:
      "Generated bullets carry evidence_ids back to the source. Provenance is part of the schema.",
  },
  {
    id: "redteam",
    label: "5. Red-team review",
    caption:
      "Adversarial reviewer flags unsupported metrics, vague language, and duplicate bullets before export.",
  },
  {
    id: "export",
    label: "6. Export",
    caption:
      "Findings become arbitration decisions. Hard-fail bullets are pulled from export until the source supports them.",
  },
];

const STRENGTH_BADGE: Record<Strength, string> = {
  strong: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  weak: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  adjacent: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  missing: "bg-rose-500/15 text-rose-300 border-rose-500/40",
};

const STRENGTH_LABEL: Record<Strength, string> = {
  strong: "strong",
  weak: "weak",
  adjacent: "adjacent",
  missing: "missing",
};

export function DemoContainer() {
  const [stageIdx, setStageIdx] = useState(0);
  const stage = STAGES[stageIdx];

  const sourcesById = useMemo(
    () => Object.fromEntries(sources.map((s) => [s.id, s])),
    [],
  );
  const evidenceById = useMemo(
    () => Object.fromEntries(evidenceItems.map((e) => [e.id, e])),
    [],
  );
  const bulletById = useMemo(
    () => Object.fromEntries(bullets.map((b) => [b.id, b])),
    [],
  );

  const flaggedBulletIds = useMemo(
    () =>
      new Set(
        decisions
          .filter((d) => d.action === "flag_for_user" || d.action === "remove")
          .map((d) => findings.find((f) => f.id === d.findingId)?.bulletId)
          .filter(Boolean) as string[],
      ),
    [],
  );

  const exportBullets = bullets.filter((b) => !flaggedBulletIds.has(b.id));

  return (
    <div className="flex flex-col gap-6">
      <Header />

      <StageNav stageIdx={stageIdx} setStageIdx={setStageIdx} />

      <div className="rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-4 py-3">
        <p className="text-sm text-[var(--foreground)]/90">{stage.caption}</p>
      </div>

      <div className="min-h-[420px]">
        {stage.id === "input" && <InputView />}
        {stage.id === "evidence" && <EvidenceView />}
        {stage.id === "coverage" && <CoverageView />}
        {stage.id === "bullets" && (
          <BulletsView evidenceById={evidenceById} sourcesById={sourcesById} />
        )}
        {stage.id === "redteam" && (
          <RedTeamView
            bulletById={bulletById}
            evidenceById={evidenceById}
            sourcesById={sourcesById}
          />
        )}
        {stage.id === "export" && (
          <ExportView
            exportBullets={exportBullets}
            flaggedBulletIds={flaggedBulletIds}
          />
        )}
      </div>

      <Controls
        stageIdx={stageIdx}
        setStageIdx={setStageIdx}
        totalStages={STAGES.length}
      />
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-mono text-[var(--muted)]">case study · interactive</div>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
        Evidence-grounded AI evaluation pipeline
      </h1>
      <p className="text-sm text-[var(--muted)] max-w-2xl">
        Resume bullets are an excuse. The real demo is what the pipeline{" "}
        <em>refuses</em>{" "}
        to export when the evidence doesn&apos;t back the claim. Step through the run.
      </p>
    </div>
  );
}

function StageNav({
  stageIdx,
  setStageIdx,
}: {
  stageIdx: number;
  setStageIdx: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STAGES.map((s, i) => {
        const active = i === stageIdx;
        const done = i < stageIdx;
        return (
          <button
            key={s.id}
            onClick={() => setStageIdx(i)}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
              active
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-2)]"
                : done
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-[var(--border)] bg-[var(--panel-2)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function Controls({
  stageIdx,
  setStageIdx,
  totalStages,
}: {
  stageIdx: number;
  setStageIdx: (i: number) => void;
  totalStages: number;
}) {
  const atEnd = stageIdx === totalStages - 1;
  const atStart = stageIdx === 0;
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setStageIdx(0)}
        className="text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        Reset
      </button>
      <button
        onClick={() => setStageIdx(Math.max(0, stageIdx - 1))}
        disabled={atStart}
        className="text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40 disabled:hover:text-[var(--muted)]"
      >
        ← Back
      </button>
      <button
        onClick={() => setStageIdx(Math.min(totalStages - 1, stageIdx + 1))}
        disabled={atEnd}
        className="text-xs px-3 py-1.5 rounded border border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-2)] hover:bg-[var(--accent)]/25 disabled:opacity-40"
      >
        {atEnd ? "Done" : "Next →"}
      </button>
      <span className="ml-auto text-xs font-mono text-[var(--muted)]">
        {stageIdx + 1} / {totalStages}
      </span>
    </div>
  );
}

function InputView() {
  return (
    <div className="grid md:grid-cols-3 gap-3 fade-in">
      {sources.map((s) => (
        <div
          key={s.id}
          className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">
              source
            </span>
            <span className="text-xs font-mono text-[var(--accent-2)]">{s.filename}</span>
          </div>
          <p className="text-sm text-[var(--foreground)]/85 leading-relaxed">{s.excerpt}</p>
        </div>
      ))}
    </div>
  );
}

function EvidenceView() {
  return (
    <div className="grid md:grid-cols-2 gap-3 fade-in">
      {evidenceItems.map((e) => (
        <div
          key={e.id}
          className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">
              evidence
            </span>
            <span className="text-[10px] font-mono text-[var(--accent-2)] bg-[var(--accent)]/10 border border-[var(--accent)]/30 px-2 py-0.5 rounded">
              {e.category}
            </span>
          </div>
          <p className="text-sm text-[var(--foreground)]/90 leading-relaxed">{e.text}</p>
          <div className="text-[10px] font-mono text-[var(--muted)] flex items-center gap-1">
            <span>id:</span>
            <span className="text-[var(--foreground)]/70">{e.id}</span>
            <span className="ml-auto">from {e.sourceId}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CoverageView() {
  const score =
    requirements.filter((r) => r.strength === "strong").length /
    requirements.length;
  return (
    <div className="flex flex-col gap-3 fade-in">
      <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-4 py-2">
        <span className="text-xs font-mono text-[var(--muted)]">
          target: AI Evaluation Systems Engineer
        </span>
        <span className="text-xs font-mono text-[var(--muted)]">
          coverage score:{" "}
          <span className="text-[var(--accent-2)]">{Math.round(score * 100)}%</span>
        </span>
      </div>
      {requirements.map((r) => (
        <div
          key={r.id}
          className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 flex items-start gap-4"
        >
          <span
            className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border shrink-0 ${STRENGTH_BADGE[r.strength]}`}
          >
            {STRENGTH_LABEL[r.strength]}
          </span>
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-sm text-[var(--foreground)]/90 leading-snug">{r.text}</p>
            <p className="text-xs text-[var(--muted)] leading-relaxed">{r.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BulletsView({
  evidenceById,
  sourcesById,
}: {
  evidenceById: Record<string, (typeof evidenceItems)[number]>;
  sourcesById: Record<string, (typeof sources)[number]>;
}) {
  return (
    <div className="flex flex-col gap-3 fade-in">
      {bullets.map((b) => {
        const ev = evidenceById[b.evidenceIds[0]];
        const src = ev ? sourcesById[ev.sourceId] : null;
        return (
          <div
            key={b.id}
            className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">
                bullet · {b.variant}
              </span>
              <span className="text-[10px] font-mono text-[var(--muted)]">id: {b.id}</span>
            </div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">{b.text}</p>
            <div className="rounded-sm border border-dashed border-[var(--border)] bg-[var(--panel-2)] p-3 flex flex-col gap-1">
              <div className="text-[10px] font-mono text-[var(--accent-2)] uppercase tracking-wider">
                evidence link → {b.evidenceIds.join(", ")}
              </div>
              {ev && (
                <p className="text-xs text-[var(--muted)] italic leading-relaxed">
                  &ldquo;{ev.text}&rdquo;{" "}
                  {src && (
                    <span className="not-italic text-[var(--muted)]/80">— {src.filename}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RedTeamView({
  bulletById,
  evidenceById,
  sourcesById,
}: {
  bulletById: Record<string, (typeof bullets)[number]>;
  evidenceById: Record<string, (typeof evidenceItems)[number]>;
  sourcesById: Record<string, (typeof sources)[number]>;
}) {
  return (
    <div className="flex flex-col gap-3 fade-in">
      {findings.map((f) => {
        const b = bulletById[f.bulletId];
        const ev = b ? evidenceById[b.evidenceIds[0]] : null;
        const src = ev ? sourcesById[ev.sourceId] : null;
        return (
          <div
            key={f.id}
            className="rounded-md border border-rose-500/40 bg-rose-500/5 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border border-rose-500/50 bg-rose-500/15 text-rose-300">
                  hard fail
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                  issue: {f.issue.replace(/_/g, " ")}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--muted)]">
                target: {f.bulletId}
              </span>
            </div>

            {b && (
              <div className="rounded-sm border border-[var(--border)] bg-[var(--panel)] p-3">
                <div className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider mb-1">
                  bullet under review
                </div>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {renderBulletWithHighlight(b.text, "73%")}
                </p>
              </div>
            )}

            {ev && (
              <div className="rounded-sm border border-[var(--border)] bg-[var(--panel-2)] p-3 flex flex-col gap-1">
                <div className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">
                  what the source actually says
                </div>
                <p className="text-xs text-[var(--foreground)]/80 italic leading-relaxed">
                  &ldquo;{ev.text}&rdquo;{" "}
                  {src && (
                    <span className="not-italic text-[var(--muted)]/80">— {src.filename}</span>
                  )}
                </p>
              </div>
            )}

            <div>
              <div className="text-[10px] font-mono text-rose-300 uppercase tracking-wider mb-1">
                finding
              </div>
              <p className="text-sm text-[var(--foreground)]/90 leading-relaxed">
                {f.description}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">
                Suggested action: {f.suggestedAction}
              </p>
            </div>
          </div>
        );
      })}

      <div className="rounded-md border border-[var(--border)] bg-[var(--panel-2)] p-4">
        <div className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider mb-2">
          rule that fired (red_team_review.py)
        </div>
        <pre className="text-[11px] font-mono text-[var(--foreground)]/80 leading-relaxed overflow-x-auto">{`unsupported_metrics = [
  token for token in bullet_metrics
  if token not in supported_metrics
  and token not in {"1", "2", "3"}
]
if unsupported_metrics:
    findings.append(ReviewFinding(
        severity="hard_fail",
        issue_type="inflated_metric",
        ...
    ))`}</pre>
      </div>
    </div>
  );
}

function renderBulletWithHighlight(text: string, highlight: string) {
  const idx = text.indexOf(highlight);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-rose-500/30 text-rose-100 px-1 rounded line-through decoration-rose-300/70">
        {text.slice(idx, idx + highlight.length)}
      </span>
      {text.slice(idx + highlight.length)}
    </>
  );
}

function ExportView({
  exportBullets,
  flaggedBulletIds,
}: {
  exportBullets: typeof bullets;
  flaggedBulletIds: Set<string>;
}) {
  const flaggedDecisions = decisions
    .map((d) => {
      const f = findings.find((x) => x.id === d.findingId);
      return f ? { decision: d, finding: f } : null;
    })
    .filter(Boolean) as { decision: (typeof decisions)[number]; finding: (typeof findings)[number] }[];

  return (
    <div className="grid md:grid-cols-2 gap-4 fade-in">
      <div className="flex flex-col gap-3">
        <div className="text-xs font-mono text-emerald-300 uppercase tracking-wider">
          exported · {exportBullets.length} bullets
        </div>
        {exportBullets.map((b) => (
          <div
            key={b.id}
            className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col gap-2"
          >
            <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-wider">
              accepted · {b.variant}
            </span>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">{b.text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-xs font-mono text-rose-300 uppercase tracking-wider">
          held back · {flaggedBulletIds.size}
        </div>
        {flaggedDecisions.map(({ decision, finding }) => {
          const b = bullets.find((x) => x.id === finding.bulletId);
          if (!b) return null;
          return (
            <div
              key={decision.findingId}
              className="rounded-md border border-rose-500/40 bg-rose-500/5 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300">
                  arbiter: {decision.action.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] font-mono text-[var(--muted)]">{b.id}</span>
              </div>
              <p className="text-sm text-[var(--foreground)]/80 line-through leading-relaxed">
                {b.text}
              </p>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{decision.rationale}</p>
            </div>
          );
        })}

        <div className="rounded-md border border-[var(--border)] bg-[var(--panel-2)] p-4">
          <div className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider mb-2">
            also surfaced
          </div>
          <ul className="text-xs text-[var(--foreground)]/85 leading-relaxed flex flex-col gap-1">
            <li>· <span className="text-[var(--muted)]">missing</span>: RAG / vector DB / embeddings — not in source.</li>
            <li>· <span className="text-[var(--muted)]">weak</span>: statistical eval methods — only weekly summaries cited.</li>
            <li>· <span className="text-[var(--muted)]">adjacent</span>: LangSmith / Langfuse — no deployment cited.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
