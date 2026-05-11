"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserPanel } from "./BrowserPanel";
import { sitesSeed } from "./script";

type Phase = "idle" | "fetching" | "ready" | "turning-in" | "done";
type RowStatus = "ready" | "turning-in" | "turned-in";
type Result = "" | "Pass" | "Fail";

type Row = {
  id: string;
  tower: string;
  modelUrl: string | null;
  result: Result;
  selected: boolean;
  status: RowStatus;
};

type LogKind = "info" | "ok" | "warn" | "err" | "section" | "user";
type LogLine = { id: number; t: string; kind: LogKind; text: string };

type AfterMetrics = { clicks: number };

const SUFFIX = ["7c3a", "91bb", "c4e1", "04ed", "ff20"];
const seed = sitesSeed.map((s, i) => ({
  id: s.id,
  tower: s.tower,
  modelUrl: i % 2 === 0 ? `model3d://share/${s.id}-${SUFFIX[i] ?? "abcd"}` : null,
}));

function ts(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function AfterMode({
  metricsRef,
  onChange,
  autoplay,
}: {
  metricsRef: { current: AfterMetrics };
  onChange: () => void;
  autoplay: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [rows, setRows] = useState<Row[]>([]);
  const [logs, setLogs] = useState<LogLine[]>([]);

  const rowsRef = useRef<Row[]>(rows);
  rowsRef.current = rows;
  const logIdRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const autoFetched = useRef(false);
  const autoMarked = useRef(false);
  const autoTurnedIn = useRef(false);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const schedule = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  };

  const bump = () => {
    metricsRef.current.clicks += 1;
    onChange();
  };

  const pushLog = (kind: LogKind, text: string) => {
    setLogs((ls) => [...ls, { id: logIdRef.current++, t: ts(), kind, text }]);
  };

  const fetchSites = () => {
    if (phase !== "idle") return;
    bump();
    setPhase("fetching");
    pushLog("user", "[reviewer] click · Fetch Ready for QA Sites");
    pushLog("section", "[orchestrator] fetch ready-for-qa queue");
    pushLog("info", "[crm] auth · session ok");

    schedule(() => {
      pushLog("ok", "[crm] queue returned · 5 sites");
      pushLog("section", "[orchestrator] prepare phase · 0/5");
    }, 600);

    let t = 950;
    seed.forEach((s, i) => {
      schedule(() => pushLog("info", `[portal] ${s.id} · scope=all_sites · session lookup`), t);
      t += 180;
      schedule(() => pushLog("info", `[portal] ${s.id} · session opened · 360 audit · adding "Top of Tower"`), t);
      t += 200;
      if (s.modelUrl) {
        schedule(() => pushLog("info", `[model3d] ${s.id} · model found · share link copied`), t);
        t += 180;
        schedule(() => pushLog("info", `[portal] ${s.id} · 3d link attached`), t);
        t += 160;
      } else {
        schedule(() => pushLog("warn", `[model3d] ${s.id} · no model · skipping`), t);
        t += 200;
      }
      schedule(() => {
        pushLog("ok", `[orchestrator] ${s.id} · prepared ✓ (${i + 1}/5)`);
        setRows((rs) => [
          ...rs,
          {
            id: s.id,
            tower: s.tower,
            modelUrl: s.modelUrl,
            result: "",
            selected: false,
            status: "ready",
          },
        ]);
      }, t);
      t += 320;
    });
    schedule(() => {
      pushLog("section", "[orchestrator] prepare complete · 5/5 ready for review");
      setPhase("ready");
    }, t + 100);
  };

  const setResult = (id: string, result: Result) => {
    if (rowsRef.current.find((r) => r.id === id)?.status !== "ready") return;
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, result, selected: true } : r))
    );
    bump();
    pushLog("user", `[reviewer] ${id} · marked ${result}`);
  };

  const toggleSelected = (id: string) => {
    setRows((rs) =>
      rs.map((r) =>
        r.id === id && r.status === "ready" && r.result ? { ...r, selected: !r.selected } : r
      )
    );
    bump();
  };

  const turnIn = () => {
    const marked = rowsRef.current.filter((r) => r.selected && r.status === "ready");
    if (!marked.length) return;
    bump();
    setPhase("turning-in");
    pushLog("user", `[reviewer] click · Turn In Selected (${marked.length})`);
    pushLog("section", `[orchestrator] turn-in start · ${marked.length} sites`);

    let t = 280;
    marked.forEach((r, i) => {
      schedule(() => {
        setRows((rs) => rs.map((rr) => (rr.id === r.id ? { ...rr, status: "turning-in" } : rr)));
        pushLog("info", `[crm] ${r.id} · open review record form`);
      }, t);
      t += 240;
      schedule(
        () =>
          pushLog(
            "info",
            `[crm] ${r.id} · fill: url=portal://sessions/${r.id} · reviewer=Casey Morgan · result=${r.result}${
              r.result === "Fail" ? " · reason=<auto>" : ""
            }`
          ),
        t
      );
      t += 280;
      schedule(() => {
        pushLog("ok", `[crm] ${r.id} · saved ✓ (${i + 1}/${marked.length})`);
        setRows((rs) => rs.map((rr) => (rr.id === r.id ? { ...rr, status: "turned-in" } : rr)));
      }, t);
      t += 160;
    });
    schedule(() => {
      pushLog("section", `[orchestrator] turn-in complete · ${marked.length}/${marked.length} saved`);
      setPhase("done");
    }, t + 200);
  };

  // Autoplay step 1: fetch on mount; step 2: mark each row Pass when ready.
  useEffect(() => {
    if (!autoplay) return;
    if (phase === "idle" && !autoFetched.current) {
      autoFetched.current = true;
      schedule(() => fetchSites(), 700);
    } else if (phase === "ready" && !autoMarked.current) {
      autoMarked.current = true;
      let d = 600;
      rowsRef.current.forEach((r) => {
        schedule(() => setResult(r.id, "Pass"), d);
        d += 380;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, autoplay]);

  // Autoplay step 3: when all rows are observed marked, fire turn-in.
  // Watching `rows` (not a timer) avoids racing the last setResult.
  useEffect(() => {
    if (!autoplay) return;
    if (phase !== "ready") return;
    if (!autoMarked.current || autoTurnedIn.current) return;
    if (rows.length === 0) return;
    if (!rows.every((r) => r.result && r.selected)) return;
    autoTurnedIn.current = true;
    schedule(() => turnIn(), 700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, phase, rows]);

  const selectedCount = rows.filter((r) => r.selected && r.status === "ready").length;
  const turnedInCount = rows.filter((r) => r.status === "turned-in").length;
  const turnInLive = selectedCount > 0 && phase === "ready";

  const subhead =
    phase === "idle"
      ? "No sites loaded yet."
      : phase === "fetching"
      ? "Orchestrator is preparing sites…"
      : phase === "ready"
      ? `${rows.length} sites prepared · mark pass/fail and turn in.`
      : phase === "turning-in"
      ? `Turning in ${selectedCount + turnedInCount} sites…`
      : `Batch complete · ${turnedInCount} review records filed.`;

  return (
    <div className="flex flex-col gap-4">
      <BrowserPanel url="https://spiderzz.local/dashboard" title="SpiderZZ Dashboard">
        <div className="p-5 flex flex-col gap-4 relative min-h-[420px]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium">Review queue</div>
              <div className="text-xs text-[var(--muted)]">{subhead}</div>
            </div>
            <div className="flex gap-2">
              {phase === "idle" && (
                <button
                  onClick={fetchSites}
                  className="text-sm px-4 py-2 rounded bg-[var(--accent)] text-white pulse-target"
                >
                  Fetch Ready for QA Sites
                </button>
              )}
              {phase === "fetching" && (
                <button
                  disabled
                  className="text-sm px-4 py-2 rounded bg-[var(--panel-2)] text-[var(--muted)] cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Spinner /> Fetching…
                </button>
              )}
              {phase === "ready" && (
                <button
                  onClick={turnIn}
                  disabled={!turnInLive}
                  className={`text-sm px-4 py-2 rounded transition-colors ${
                    turnInLive
                      ? "bg-[var(--accent)] text-white pulse-target"
                      : "bg-[var(--panel-2)] text-[var(--muted)] cursor-not-allowed"
                  }`}
                >
                  Turn In Selected{selectedCount ? ` (${selectedCount})` : ""}
                </button>
              )}
              {phase === "turning-in" && (
                <button
                  disabled
                  className="text-sm px-4 py-2 rounded bg-[var(--panel-2)] text-[var(--muted)] cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Spinner /> Turning in…
                </button>
              )}
              {phase === "done" && (
                <span className="text-sm px-4 py-2 rounded bg-[var(--good)]/20 text-[var(--good)] border border-[var(--good)]/40">
                  All turned in ✓
                </span>
              )}
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-[var(--muted)] py-12 text-center">
              {phase === "idle"
                ? "Click “Fetch Ready for QA Sites” to load the queue."
                : "Waiting on orchestrator…"}
            </div>
          ) : (
            <div className="rounded-md border border-[var(--border)] overflow-hidden fade-in">
              <table className="w-full text-sm">
                <thead className="bg-[var(--panel-2)] text-[var(--muted)] text-xs">
                  <tr>
                    <th className="text-left px-3 py-2">Site</th>
                    <th className="text-left px-3 py-2">Tower</th>
                    <th className="text-left px-3 py-2">Prepared</th>
                    <th className="text-left px-3 py-2">3D</th>
                    <th className="text-left px-3 py-2">Result</th>
                    <th className="text-left px-3 py-2 w-28">Status</th>
                    <th className="text-center px-3 py-2 w-20">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const interactable = r.status === "ready";
                    return (
                      <tr key={r.id} className="border-t border-[var(--border)] fade-in">
                        <td className="px-3 py-2 font-mono text-[var(--accent-2)]">{r.id}</td>
                        <td className="px-3 py-2 text-[var(--muted)]">{r.tower}</td>
                        <td className="px-3 py-2">
                          <span className="text-xs text-[var(--good)]">✓ session + 360s</span>
                        </td>
                        <td className="px-3 py-2">
                          {r.modelUrl ? (
                            <span className="text-xs text-[var(--good)]">✓ attached</span>
                          ) : (
                            <span className="text-xs text-[var(--muted)]">none</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => setResult(r.id, "Pass")}
                              disabled={!interactable}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${
                                r.result === "Pass"
                                  ? "border-[var(--good)] text-[var(--good)] bg-[var(--good)]/15"
                                  : interactable
                                  ? "border-[var(--border)] text-[var(--muted)] hover:border-[var(--good)] hover:text-[var(--good)]"
                                  : "border-[var(--border)] text-[var(--border)] cursor-not-allowed"
                              }`}
                            >
                              Pass
                            </button>
                            <button
                              onClick={() => setResult(r.id, "Fail")}
                              disabled={!interactable}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${
                                r.result === "Fail"
                                  ? "border-[var(--bad)] text-[var(--bad)] bg-[var(--bad)]/15"
                                  : interactable
                                  ? "border-[var(--border)] text-[var(--muted)] hover:border-[var(--bad)] hover:text-[var(--bad)]"
                                  : "border-[var(--border)] text-[var(--border)] cursor-not-allowed"
                              }`}
                            >
                              Fail
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {r.status === "turned-in" ? (
                            <span className="text-xs text-[var(--good)] inline-flex items-center gap-1">
                              turned in ✓
                            </span>
                          ) : r.status === "turning-in" ? (
                            <span className="text-xs text-[var(--accent-2)] inline-flex items-center gap-1">
                              <Spinner /> turning in
                            </span>
                          ) : r.result ? (
                            <span className="text-xs text-[var(--accent-2)]">ready</span>
                          ) : (
                            <span className="text-xs text-[var(--muted)]">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Checkbox
                            checked={r.status === "turned-in" ? true : r.selected}
                            disabled={r.status !== "ready" || !r.result}
                            done={r.status === "turned-in"}
                            onChange={() => toggleSelected(r.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </BrowserPanel>

      <Terminal logs={logs} />
    </div>
  );
}

function Terminal({ logs }: { logs: LogLine[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[#0a0c10] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--panel-2)]">
        <span className="w-2 h-2 rounded-full bg-[var(--good)] inline-block" />
        <span className="text-xs font-mono text-[var(--muted)]">orchestrator.log</span>
        <span className="ml-auto text-xs text-[var(--muted)] font-mono">{logs.length} lines</span>
      </div>
      <div ref={ref} className="font-mono text-xs leading-5 max-h-52 overflow-y-auto p-3">
        {logs.length === 0 ? (
          <div className="text-[var(--muted)]">— waiting for orchestrator —</div>
        ) : (
          logs.map((l) => (
            <div key={l.id} className="fade-in flex gap-3 break-all">
              <span className="text-[var(--muted)] shrink-0">{l.t}</span>
              <span className={kindClass(l.kind)}>{l.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function kindClass(k: LogKind) {
  switch (k) {
    case "ok":
      return "text-[var(--good)]";
    case "warn":
      return "text-[var(--warn)]";
    case "err":
      return "text-[var(--bad)]";
    case "section":
      return "text-[var(--accent-2)] font-medium";
    case "user":
      return "text-[#a78bfa]";
    case "info":
    default:
      return "text-[var(--foreground)]";
  }
}

function Spinner() {
  return (
    <span
      className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
      aria-label="loading"
    />
  );
}

function Checkbox({
  checked,
  disabled,
  done,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  done?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-pressed={checked}
      className={`relative w-5 h-5 rounded border inline-flex items-center justify-center transition-all ${
        done
          ? "border-[var(--good)] bg-[var(--good)] cursor-default"
          : checked
          ? "border-[var(--accent)] bg-[var(--accent)] cursor-pointer"
          : disabled
          ? "border-[var(--border)] bg-transparent cursor-not-allowed"
          : "border-[var(--muted)] bg-transparent hover:border-[var(--accent)] cursor-pointer"
      }`}
    >
      {checked && (
        <svg
          viewBox="0 0 16 16"
          className={`w-3 h-3 fade-in ${done ? "text-black" : "text-white"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 8 7 12 13 4" />
        </svg>
      )}
    </button>
  );
}
