"use client";
import { useState } from "react";
import type { DragEvent } from "react";
import { samples } from "./fixtures";
import { PrimaryButton } from "./ui";

type Props = {
  selectedSampleId: string;
  setSelectedSampleId: (id: string) => void;
  onStart: () => void;
};

export function IngestStage({ selectedSampleId, setSelectedSampleId, onStart }: Props) {
  const [dragging, setDragging] = useState(false);

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    onStart();
  };

  const selected = samples.find((s) => s.id === selectedSampleId) ?? samples[0];

  return (
    <div className="flex flex-col gap-5">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onStart}
        className={`cursor-pointer rounded-lg border-2 border-dashed transition-colors p-8 md:p-12 text-center ${
          dragging
            ? "border-[var(--accent)] bg-[var(--accent)]/5"
            : "border-[var(--border)] bg-[var(--panel)] hover:border-[var(--accent-2)]/60"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-3xl">📁</div>
          <div className="text-base md:text-lg font-medium">Drop SD-card folder here</div>
          <div className="text-xs text-[var(--muted)] max-w-md">
            Or pick a sample dataset below. Real drops are accepted but the demo runs on the bundled
            fixtures so it works offline.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
          Sample datasets · drawn from SpotCheck&apos;s real test fixtures
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {samples.map((s) => {
            const active = s.id === selectedSampleId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSampleId(s.id)}
                className={`text-left rounded-md border p-3 transition-colors ${
                  active
                    ? "border-[var(--accent)] bg-[var(--panel)]"
                    : "border-[var(--border)] bg-[var(--panel-2)] hover:border-[var(--accent-2)]/60"
                }`}
              >
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-[11px] text-[var(--muted)] mt-1 leading-snug">
                  {s.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs font-mono text-[var(--muted)]">
          Selected: <span className="text-[var(--foreground)]">{selected.name}</span>
        </div>
        <PrimaryButton onClick={onStart}>Start metadata QA pass →</PrimaryButton>
      </div>
    </div>
  );
}
