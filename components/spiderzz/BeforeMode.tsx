"use client";
import { ReactNode } from "react";
import type { BeforeState, Step } from "./types";
import { BrowserPanel } from "./BrowserPanel";

type Props = {
  state: BeforeState;
  step: Step | null;
  onTarget: (targetId: string) => void;
  interactive: boolean;
};

function Hot({
  id,
  step,
  onTarget,
  interactive,
  children,
  className = "",
  as: As = "button",
}: {
  id: string;
  step: Step | null;
  onTarget: (id: string) => void;
  interactive: boolean;
  children: ReactNode;
  className?: string;
  as?: "button" | "div";
}) {
  const isTarget = step?.targetId === id;
  const cls = `${className} ${isTarget ? "pulse-target" : ""}`;
  const handler = () => {
    if (isTarget) onTarget(id);
  };
  if (As === "button") {
    return (
      <button
        data-target={id}
        onClick={handler}
        disabled={interactive && !isTarget}
        className={`${cls} ${interactive && !isTarget ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        {children}
      </button>
    );
  }
  return (
    <div
      data-target={id}
      onClick={handler}
      className={`${cls} ${interactive && !isTarget ? "cursor-default" : "cursor-pointer"}`}
    >
      {children}
    </div>
  );
}

export function BeforeMode({ state, step, onTarget, interactive }: Props) {
  const tab = (id: string, label: string, panel: BeforeState["activePanel"]) => {
    const active = state.activePanel === panel;
    const isTarget = step?.targetId === id;
    return (
      <button
        key={id}
        data-target={id}
        onClick={() => isTarget && onTarget(id)}
        disabled={interactive && !isTarget}
        className={`px-4 py-2 text-sm rounded-t-md border border-b-0 ${
          active
            ? "bg-[var(--panel)] border-[var(--border)] text-[var(--foreground)]"
            : "bg-[var(--panel-2)]/60 border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
        } ${isTarget ? "pulse-target" : ""} ${
          interactive && !isTarget ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-0">
      <div className="flex gap-1 px-2">
        {tab("tab-crm", "CRM / Workflow", "crm")}
        {tab("tab-portal", "Inspection Portal", "portal")}
        {tab("tab-model3d", "3D Model Platform", "model3d")}
      </div>
      <div className="border-t border-[var(--border)]" />
      {state.activePanel === "crm" && (
        <BrowserPanel url="https://crm.example.com/queues/qa-ready" title="CRM">
          <CrmContent state={state} step={step} onTarget={onTarget} interactive={interactive} Hot={Hot} />
        </BrowserPanel>
      )}
      {state.activePanel === "portal" && (
        <BrowserPanel url="https://portal.example.com/sites" title="Inspection Portal">
          <PortalContent state={state} step={step} onTarget={onTarget} interactive={interactive} Hot={Hot} />
        </BrowserPanel>
      )}
      {state.activePanel === "model3d" && (
        <BrowserPanel url="https://model3d.example.com/library" title="3D Models">
          <ModelContent state={state} step={step} onTarget={onTarget} interactive={interactive} Hot={Hot} />
        </BrowserPanel>
      )}
    </div>
  );
}

type SubProps = Props & { Hot: typeof Hot };

function CrmContent({ state, step, onTarget, interactive, Hot }: SubProps) {
  const { crm, clipboard } = state;
  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--foreground)]">Queue: Ready for QA</h3>
        <span className="text-xs text-[var(--muted)]">Sorted: oldest first</span>
      </div>
      <div className="rounded-md border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--panel-2)] text-[var(--muted)] text-xs">
            <tr>
              <th className="text-left px-3 py-2">Site</th>
              <th className="text-left px-3 py-2">Tower</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {crm.queue.map((row) => {
              const isCursor = crm.cursorRow === row.id;
              return (
                <tr
                  key={row.id}
                  className={`border-t border-[var(--border)] ${
                    isCursor ? "bg-[var(--accent)]/10" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <Hot
                      id={`crm-row-${row.id}`}
                      step={step}
                      onTarget={onTarget}
                      interactive={interactive}
                      as="div"
                      className="inline-block px-2 py-1 -mx-2 -my-1 rounded"
                    >
                      <span className="font-mono text-[var(--accent-2)]">{row.id}</span>
                    </Hot>
                  </td>
                  <td className="px-3 py-2 text-[var(--muted)]">{row.tower}</td>
                  <td className="px-3 py-2">
                    {row.status === "queued" && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--warn)]/15 text-[var(--warn)]">queued</span>
                    )}
                    {row.status === "reviewing" && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent-2)]">reviewing</span>
                    )}
                    {row.status === "done" && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--good)]/15 text-[var(--good)]">done</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <Hot
                        id={`crm-copy-${row.id}`}
                        step={step}
                        onTarget={onTarget}
                        interactive={interactive}
                        className="text-xs px-2 py-1 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        copy id
                      </Hot>
                      <Hot
                        id={`crm-create-${row.id}`}
                        step={step}
                        onTarget={onTarget}
                        interactive={interactive}
                        className="text-xs px-2 py-1 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        create review record
                      </Hot>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {clipboard && (
        <div className="text-xs text-[var(--muted)] font-mono">
          clipboard: <span className="text-[var(--accent-2)]">{clipboard}</span>
        </div>
      )}
      {crm.formOpen && (
        <div className="fade-in rounded-md border border-[var(--border)] bg-[var(--panel-2)] p-4 flex flex-col gap-3">
          <div className="text-sm font-medium">New review record · {crm.cursorRow}</div>
          <Hot
            id="crm-form-url"
            step={step}
            onTarget={onTarget}
            interactive={interactive}
            as="div"
            className="rounded border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs font-mono"
          >
            <span className="text-[var(--muted)]">Session URL: </span>
            <span className="text-[var(--accent-2)]">{crm.form.url || "<paste URL here>"}</span>
          </Hot>
          <Hot
            id="crm-form-reviewer"
            step={step}
            onTarget={onTarget}
            interactive={interactive}
            as="div"
            className="rounded border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs"
          >
            <span className="text-[var(--muted)]">Reviewer: </span>
            <span>{crm.form.reviewer || "<select reviewer>"}</span>
          </Hot>
          <div className="flex gap-2">
            <Hot
              id="crm-form-pass"
              step={step}
              onTarget={onTarget}
              interactive={interactive}
              className={`text-xs px-3 py-1.5 rounded border ${
                crm.form.result === "Pass"
                  ? "border-[var(--good)] text-[var(--good)] bg-[var(--good)]/10"
                  : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              Pass
            </Hot>
            <Hot
              id="crm-form-fail"
              step={step}
              onTarget={onTarget}
              interactive={interactive}
              className={`text-xs px-3 py-1.5 rounded border ${
                crm.form.result === "Fail"
                  ? "border-[var(--bad)] text-[var(--bad)] bg-[var(--bad)]/10"
                  : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              Fail
            </Hot>
          </div>
          <div className="flex justify-end">
            <Hot
              id="crm-form-save"
              step={step}
              onTarget={onTarget}
              interactive={interactive}
              className="text-xs px-3 py-1.5 rounded bg-[var(--accent)] text-white"
            >
              Save record
            </Hot>
          </div>
        </div>
      )}
    </div>
  );
}

function PortalContent({ state, step, onTarget, interactive, Hot }: SubProps) {
  const { portal, clipboard } = state;
  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <Hot
          id="portal-scope"
          step={step}
          onTarget={onTarget}
          interactive={interactive}
          className="text-xs px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--panel-2)]"
        >
          Scope: {portal.scope === "my" ? "My Sites" : "All Sites"} ▾
        </Hot>
        <Hot
          id="portal-search-input"
          step={step}
          onTarget={onTarget}
          interactive={interactive}
          as="div"
          className="flex-1 px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--panel-2)] text-xs font-mono text-[var(--accent-2)] min-h-[28px]"
        >
          {portal.search || <span className="text-[var(--muted)]">search site id…</span>}
        </Hot>
        <Hot
          id="portal-search-go"
          step={step}
          onTarget={onTarget}
          interactive={interactive}
          className="text-xs px-3 py-1.5 rounded bg-[var(--accent)] text-white"
        >
          Search
        </Hot>
      </div>

      {portal.scope === "my" && portal.search && !portal.sessionId && (
        <div className="text-xs text-[var(--bad)] fade-in">
          0 results - scope is &quot;My Sites&quot;. Site exists but isn&apos;t assigned to you.
        </div>
      )}

      {portal.sessionId && !portal.sessionOpen && (
        <div className="rounded-md border border-[var(--border)] overflow-hidden fade-in">
          <Hot
            id="portal-session-row"
            step={step}
            onTarget={onTarget}
            interactive={interactive}
            as="div"
            className="px-3 py-3 hover:bg-[var(--panel-2)] flex justify-between items-center"
          >
            <div>
              <div className="text-sm font-mono text-[var(--accent-2)]">{portal.sessionId}</div>
              <div className="text-xs text-[var(--muted)]">Session · 3 uploads</div>
            </div>
            <span className="text-xs text-[var(--muted)]">open →</span>
          </Hot>
        </div>
      )}

      {portal.sessionOpen && (
        <div data-target="portal-session-body" className="fade-in flex flex-col gap-3">
          <div className="text-sm font-medium">Session · {portal.sessionId}</div>
          <div className="grid grid-cols-3 gap-2">
            <MediaTile label="Top of Tower" present={portal.media360.topOfTower} step={step} onTarget={onTarget} interactive={interactive} Hot={Hot} addId="portal-add-tot" />
            <MediaTile label="Antenna Face" present={portal.media360.antennaFace} step={step} onTarget={onTarget} interactive={interactive} Hot={Hot} addId="portal-add-af" />
            <MediaTile label="Coax Run" present={portal.media360.coax} step={step} onTarget={onTarget} interactive={interactive} Hot={Hot} addId="portal-add-cx" />
          </div>
          <Hot
            id="portal-add-3d"
            step={step}
            onTarget={onTarget}
            interactive={interactive}
            as="div"
            className="rounded-md border border-dashed border-[var(--border)] px-3 py-3 text-xs"
          >
            {portal.modelLinked ? (
              <span className="text-[var(--good)] font-mono">3D model linked: {clipboard.startsWith("model3d") ? clipboard : "model3d://share/…"}</span>
            ) : (
              <span className="text-[var(--muted)]">3D model link: paste here</span>
            )}
          </Hot>
        </div>
      )}
    </div>
  );
}

function MediaTile({
  label,
  present,
  addId,
  step,
  onTarget,
  interactive,
  Hot,
}: {
  label: string;
  present: boolean;
  addId: string;
  step: Step | null;
  onTarget: (id: string) => void;
  interactive: boolean;
  Hot: SubProps["Hot"];
}) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel-2)] p-3 flex flex-col gap-2 text-xs">
      <div className="text-[var(--muted)]">{label}</div>
      {present ? (
        <div className="text-[var(--good)]">✓ 360 attached</div>
      ) : (
        <Hot
          id={addId}
          step={step}
          onTarget={onTarget}
          interactive={interactive}
          className="px-2 py-1 rounded border border-[var(--warn)] text-[var(--warn)]"
        >
          + add 360
        </Hot>
      )}
    </div>
  );
}

function ModelContent({ state, step, onTarget, interactive, Hot }: SubProps) {
  const { model3d } = state;
  return (
    <div className="p-5 flex flex-col gap-4">
      <Hot
        id="model3d-search"
        step={step}
        onTarget={onTarget}
        interactive={interactive}
        as="div"
        className="px-3 py-2 rounded border border-[var(--border)] bg-[var(--panel-2)] text-xs font-mono text-[var(--accent-2)] min-h-[32px]"
      >
        {model3d.search || <span className="text-[var(--muted)]">search by site id…</span>}
      </Hot>
      {model3d.foundModelFor && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel-2)] p-4 flex justify-between items-center fade-in">
          <div>
            <div className="text-sm font-mono">{model3d.foundModelFor}-7c3a</div>
            <div className="text-xs text-[var(--muted)]">model · captured 3 days ago</div>
          </div>
          <Hot
            id="model3d-copy"
            step={step}
            onTarget={onTarget}
            interactive={interactive}
            className={`text-xs px-3 py-1.5 rounded border ${
              model3d.linkCopied
                ? "border-[var(--good)] text-[var(--good)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            {model3d.linkCopied ? "✓ copied" : "copy share link"}
          </Hot>
        </div>
      )}
      {!model3d.foundModelFor && (
        <div className="text-xs text-[var(--muted)]">no model loaded — search a site id</div>
      )}
    </div>
  );
}
