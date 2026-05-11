"use client";
import { useState } from "react";
import type { Sample, Segment } from "./types";
import { MetricGrid, PrimaryButton, SegmentCard } from "./ui";

type Props = {
  sample: Sample;
  onContinue: () => void;
};

export function ClassifyStage({ sample, onContinue }: Props) {
  const [selectedId, setSelectedId] = useState<string>(sample.segments[0]?.id ?? "");
  const selected = sample.segments.find((s) => s.id === selectedId) ?? sample.segments[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
          Stage 2 · Classify segments from telemetry
        </div>
        <p className="text-sm text-[var(--muted)] max-w-3xl">
          Photos clustered by time gap, then bucketed using gimbal pitch, rotation, altitude, and
          image width. No image content is read at this stage — every decision below comes from
          metadata that was extracted from the local SD-card dump in seconds.
        </p>
      </div>

      <MetricGrid
        items={[
          { label: "photos", value: sample.photoCount.toString() },
          { label: "segments", value: sample.segments.length.toString() },
          {
            label: "altitude range",
            value: `${sample.altitudeRange.min}–${sample.altitudeRange.max} m`,
          },
          {
            label: "pitch range",
            value: `${sample.pitchRange.min}° to ${sample.pitchRange.max}°`,
          },
        ]}
      />

      <div className="grid md:grid-cols-[1fr_320px] gap-4">
        <div className="grid sm:grid-cols-2 gap-2">
          {sample.segments.map((seg) => (
            <SegmentCard
              key={seg.id}
              segment={seg}
              selected={seg.id === selectedId}
              onClick={() => setSelectedId(seg.id)}
              compact
            />
          ))}
        </div>
        <SegmentDetail segment={selected} />
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={onContinue}>Continue to QA results →</PrimaryButton>
      </div>
    </div>
  );
}

function SegmentDetail({ segment }: { segment: Segment | undefined }) {
  if (!segment) return null;
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 flex flex-col gap-3 self-start">
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
          Classification rule
        </div>
        <div className="text-sm font-mono mt-1 leading-snug">{segment.rule}</div>
      </div>
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--muted)]">
          Sample EXIF · {segment.samplePhotos.length} of {segment.photoCount}
        </div>
        <div className="mt-1 flex flex-col gap-1">
          {segment.samplePhotos.map((p) => (
            <div
              key={p.fileName}
              className="text-[11px] font-mono text-[var(--muted)] flex justify-between gap-2"
            >
              <span className="truncate">{p.fileName}</span>
              <span className="shrink-0 text-[var(--foreground)]/80">
                {p.gimbalPitch.toFixed(1)}° · {p.altitude.toFixed(0)}m
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-[11px] text-[var(--muted)] leading-snug border-t border-[var(--border)] pt-2">
        Tolerance: ±3° gimbal · full orbit ≥ 350° · partial orbit ≥ 70°
      </div>
    </div>
  );
}
