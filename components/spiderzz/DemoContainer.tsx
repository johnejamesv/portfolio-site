"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { BeforeMode } from "./BeforeMode";
import { AfterMode } from "./AfterMode";
import { beforeSteps, initialBefore } from "./script";
import type { BeforeState } from "./types";

type View = "before" | "after";
type Mode = "autoplay" | "interactive";

const AUTOPLAY_MS = 1500;
const WAIT_MS = 2200;

export function DemoContainer() {
  const [view, setView] = useState<View>("before");
  const [mode, setMode] = useState<Mode>("autoplay");

  const [state, setState] = useState<BeforeState>(initialBefore);
  const [stepIdx, setStepIdx] = useState(0);
  const [running, setRunning] = useState(true);

  const [afterResetKey, setAfterResetKey] = useState(0);
  const afterMetricsRef = useRef({ clicks: 0 });

  const step = stepIdx < beforeSteps.length ? beforeSteps[stepIdx] : null;
  const finished = stepIdx >= beforeSteps.length;

  const advance = useCallback(() => {
    setStepIdx((i) => {
      if (i >= beforeSteps.length) return i;
      const s = beforeSteps[i];
      setState((cur) => s.apply(cur));
      return i + 1;
    });
  }, []);

  // Autoplay timer for Before mode
  useEffect(() => {
    if (view !== "before") return;
    if (mode !== "autoplay") return;
    if (!running) return;
    if (finished) return;
    const delay = step?.kind === "wait" ? WAIT_MS : AUTOPLAY_MS;
    const t = window.setTimeout(advance, delay);
    return () => clearTimeout(t);
  }, [view, mode, running, stepIdx, finished, step, advance]);

  // In interactive mode, "wait" steps still need to auto-advance (user can't click "do nothing")
  useEffect(() => {
    if (view !== "before") return;
    if (mode !== "interactive") return;
    if (!step || step.kind !== "wait") return;
    const t = window.setTimeout(advance, WAIT_MS);
    return () => clearTimeout(t);
  }, [view, mode, step, advance]);

  const onTarget = (id: string) => {
    if (!step) return;
    if (step.targetId !== id) return;
    advance();
  };

  const reset = () => {
    setState(initialBefore);
    setStepIdx(0);
    setRunning(true);
    afterMetricsRef.current.clicks = 0;
    setAfterResetKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col gap-5">
      <Header />

      <ComparisonToggle view={view} setView={setView} />

      {view === "before" ? (
        <div className="flex flex-col gap-4">
          <BeforeMode
            state={state}
            step={step}
            onTarget={onTarget}
            interactive={mode === "interactive"}
          />
          <Caption
            text={
              finished
                ? "Done with one site. The full QA pass requires repeating this for every site in the queue. The throughput problem isn't any single step — it's that they don't compose."
                : step?.caption ?? ""
            }
            stepIdx={stepIdx}
            total={beforeSteps.length}
            mode={mode}
            finished={finished}
          />
        </div>
      ) : (
        <AfterMode
          key={afterResetKey}
          metricsRef={afterMetricsRef}
          onChange={() => {}}
          autoplay={mode === "autoplay"}
        />
      )}

      <Controls
        view={view}
        mode={mode}
        setMode={setMode}
        running={running}
        setRunning={setRunning}
        finished={finished}
        reset={reset}
      />

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-mono text-[var(--muted)]">case study · interactive</div>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
        SpiderZZ — human-in-the-loop QA orchestrator
      </h1>
      <p className="text-sm text-[var(--muted)] max-w-2xl">
        Telecom inspection QA used to mean juggling three platforms per site. SpiderZZ turns that into
        a prepared queue. Pick a side to see the same review handled either way.
      </p>
    </div>
  );
}

function ComparisonToggle({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
          side-by-side
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
          showing: {view === "before" ? "manual workflow" : "orchestrated"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ComparisonCard
          active={view === "before"}
          accent="bad"
          eyebrow="before"
          title="The manual workflow"
          subtitle="3 platforms · tab switching · copy / paste"
          onClick={() => setView("before")}
        />
        <ComparisonCard
          active={view === "after"}
          accent="good"
          eyebrow="after"
          title="With SpiderZZ"
          subtitle="Prepared queue · one dashboard · turn-in"
          onClick={() => setView("after")}
        />
      </div>
    </div>
  );
}

function ComparisonCard({
  active,
  accent,
  eyebrow,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  accent: "bad" | "good";
  eyebrow: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  const accentText = accent === "bad" ? "text-[var(--bad)]" : "text-[var(--good)]";
  const activeBg = accent === "bad" ? "bg-[var(--bad)]/10" : "bg-[var(--good)]/10";
  const activeBorder = accent === "bad" ? "border-[var(--bad)]/40" : "border-[var(--good)]/40";
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-left rounded-lg border p-4 transition-all ${
        active
          ? `${activeBorder} ${activeBg}`
          : "border-[var(--border)] bg-[var(--panel-2)] hover:bg-[var(--panel)]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] font-mono uppercase tracking-wider ${
            active ? accentText : "text-[var(--muted)]"
          }`}
        >
          {eyebrow}
        </span>
        {active && (
          <span className={`text-[10px] font-mono ${accentText}`}>● viewing</span>
        )}
      </div>
      <div className="text-sm font-medium mt-1 text-[var(--foreground)]">{title}</div>
      <div className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</div>
    </button>
  );
}

function Caption({
  text,
  stepIdx,
  total,
  mode,
  finished,
}: {
  text: string;
  stepIdx: number;
  total: number;
  mode: Mode;
  finished: boolean;
}) {
  const hint = !finished && mode === "interactive" ? "click the pulsing target to advance" : null;
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-4 py-3 flex justify-between items-center gap-4">
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm">{text}</p>
        {hint && (
          <p className="text-[11px] font-mono text-[var(--accent-2)]">{hint}</p>
        )}
      </div>
      <span className="text-xs font-mono text-[var(--muted)] shrink-0">
        {Math.min(stepIdx + 1, total)} / {total}
      </span>
    </div>
  );
}

function Controls({
  view,
  mode,
  setMode,
  running,
  setRunning,
  finished,
  reset,
}: {
  view: View;
  mode: Mode;
  setMode: (m: Mode) => void;
  running: boolean;
  setRunning: (b: boolean) => void;
  finished: boolean;
  reset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {view === "before" && (
        <div className="inline-flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
            mode
          </span>
          <div className="inline-flex rounded-md border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => setMode("autoplay")}
              className={`px-3 py-1.5 text-xs ${
                mode === "autoplay"
                  ? "bg-[var(--panel)] text-[var(--foreground)]"
                  : "bg-[var(--panel-2)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Watch
            </button>
            <button
              onClick={() => setMode("interactive")}
              className={`px-3 py-1.5 text-xs border-l border-[var(--border)] ${
                mode === "interactive"
                  ? "bg-[var(--panel)] text-[var(--foreground)]"
                  : "bg-[var(--panel-2)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Try it yourself
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 ml-auto">
        {view === "before" && mode === "autoplay" && !finished && (
          <button
            onClick={() => setRunning(!running)}
            className="text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {running ? "Pause" : "Play"}
          </button>
        )}
        <button
          onClick={reset}
          className="text-xs px-3 py-1.5 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="border-t border-[var(--border)] pt-6 mt-2 text-xs text-[var(--muted)] flex flex-col gap-2 max-w-3xl">
      <p>
        Real numbers, single-operator: ~25 min/site manually → under 4 min/site with the orchestrator.
        100-site batch from &quot;several days&quot; to &quot;a few hours&quot;. 1163-test unit suite green on 2026-05-06.
      </p>
      <p>
        Stack: Python · Playwright (isolated browser contexts per platform) · FastAPI + HTMX dashboard ·
        behavior-map specs as refactor guardrails. Vendor names omitted; the source repo is private.
      </p>
    </div>
  );
}
