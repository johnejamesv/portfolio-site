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
  const [, setCounterTick] = useState(0);
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
    setCounterTick((t) => t + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <Header view={view} setView={setView} />

      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <ModeToggle mode={mode} setMode={setMode} view={view} />
        <Counter state={state} after={afterMetricsRef.current.clicks} view={view} />
      </div>

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
          />
        </div>
      ) : (
        <AfterMode
          key={afterResetKey}
          metricsRef={afterMetricsRef}
          onChange={() => setCounterTick((t) => t + 1)}
          autoplay={mode === "autoplay"}
        />
      )}

      <Controls
        mode={mode}
        running={running}
        setRunning={setRunning}
        finished={finished}
        reset={reset}
        showPlayPause={view === "before"}
      />

      <Footer />
    </div>
  );
}

function Header({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="text-xs font-mono text-[var(--muted)] mb-1">case study · interactive</div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          SpiderZZ — human-in-the-loop QA orchestrator
        </h1>
        <p className="text-sm text-[var(--muted)] mt-2 max-w-2xl">
          Telecom inspection QA used to mean juggling three platforms per site. SpiderZZ turns that into
          a prepared queue. Try it both ways.
        </p>
      </div>
      <div className="inline-flex rounded-md border border-[var(--border)] overflow-hidden">
        <button
          onClick={() => setView("before")}
          className={`px-4 py-2 text-sm ${
            view === "before"
              ? "bg-[var(--panel)] text-[var(--foreground)]"
              : "bg-[var(--panel-2)] text-[var(--muted)]"
          }`}
        >
          Before · manual
        </button>
        <button
          onClick={() => setView("after")}
          className={`px-4 py-2 text-sm border-l border-[var(--border)] ${
            view === "after"
              ? "bg-[var(--panel)] text-[var(--foreground)]"
              : "bg-[var(--panel-2)] text-[var(--muted)]"
          }`}
        >
          After · orchestrated
        </button>
      </div>
    </div>
  );
}

function ModeToggle({ mode, setMode, view }: { mode: Mode; setMode: (m: Mode) => void; view: View }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-xs text-[var(--muted)]">mode</span>
      <div className="inline-flex rounded-md border border-[var(--border)] overflow-hidden">
        <button
          onClick={() => setMode("autoplay")}
          className={`px-3 py-1.5 text-xs ${
            mode === "autoplay" ? "bg-[var(--panel)]" : "bg-[var(--panel-2)] text-[var(--muted)]"
          }`}
        >
          Autoplay
        </button>
        <button
          onClick={() => setMode("interactive")}
          className={`px-3 py-1.5 text-xs border-l border-[var(--border)] ${
            mode === "interactive" ? "bg-[var(--panel)]" : "bg-[var(--panel-2)] text-[var(--muted)]"
          }`}
        >
          Try it yourself
        </button>
      </div>
      {view === "before" && mode === "interactive" && (
        <span className="text-xs text-[var(--muted)]">
          click the pulsing target to advance
        </span>
      )}
    </div>
  );
}

function Counter({ state, after, view }: { state: BeforeState; after: number; view: View }) {
  if (view === "before") {
    return (
      <div className="grid grid-cols-4 gap-3 text-xs">
        <Stat label="clicks" value={state.clicks} />
        <Stat label="tab switches" value={state.tabSwitches} />
        <Stat label="copies" value={state.copies} />
        <Stat label="pastes" value={state.pastes} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-3 text-xs">
      <Stat label="clicks" value={after} />
      <Stat label="tab switches" value={0} />
      <Stat label="copies" value={0} />
      <Stat label="pastes" value={0} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--panel-2)] min-w-[88px]">
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{label}</div>
      <div className="text-base font-mono">{value}</div>
    </div>
  );
}

function Caption({ text, stepIdx, total }: { text: string; stepIdx: number; total: number }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-4 py-3 flex justify-between items-center gap-4">
      <p className="text-sm">{text}</p>
      <span className="text-xs font-mono text-[var(--muted)] shrink-0">
        {Math.min(stepIdx + 1, total)} / {total}
      </span>
    </div>
  );
}

function Controls({
  mode,
  running,
  setRunning,
  finished,
  reset,
  showPlayPause,
}: {
  mode: Mode;
  running: boolean;
  setRunning: (b: boolean) => void;
  finished: boolean;
  reset: () => void;
  showPlayPause: boolean;
}) {
  return (
    <div className="flex gap-2">
      {showPlayPause && mode === "autoplay" && !finished && (
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
  );
}

function Footer() {
  return (
    <div className="border-t border-[var(--border)] pt-6 mt-2 text-xs text-[var(--muted)] flex flex-col gap-2 max-w-3xl">
      <p>
        Real numbers, single-operator: ~25 min/site manually → under 4 min/site with the orchestrator.
        100-site batch from "several days" to "a few hours". 1163-test unit suite green on 2026-05-06.
      </p>
      <p>
        Stack: Python · Playwright (isolated browser contexts per platform) · FastAPI + HTMX dashboard ·
        behavior-map specs as refactor guardrails. Vendor names omitted; the source repo is private.
      </p>
    </div>
  );
}
