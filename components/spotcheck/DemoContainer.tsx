"use client";

import { useEffect, useMemo, useState } from "react";
import { FlightPathModel } from "./FlightPathModel";
import { correction, samples } from "./fixtures";
import type { QaStatus, Sample, Segment } from "./types";

type DemoStage = "ingest" | "analyzing" | "results" | "correction" | "upload";

type FlightStatus = "passed" | "failed" | "review" | "not_required";

type DemoFlight = {
  id: string;
  name: string;
  type: string;
  status: FlightStatus;
  photoCount: number;
  duration: string;
  startedAt: string;
  completedAt: string;
  version?: number;
  note?: string;
  metrics: { label: string; value: string; status: FlightStatus }[];
  source: Segment;
};

type SiteMeta = {
  siteId: string;
  inspectionId: string;
  scope: string;
  location: string;
  date: string;
};

const SITE_MODEL_MAX_HEIGHT_FT = 140;
const SITE_MODEL_SOURCE_REFERENCE_M = 60;

const STAGES: { id: DemoStage; label: string; caption: string }[] = [
  {
    id: "ingest",
    label: "Upload folder",
    caption: "Start where the real app starts: a pilot selects a site and drops an SD-card folder.",
  },
  {
    id: "analyzing",
    label: "Analyze metadata",
    caption: "The app extracts local EXIF and submits a metadata-first QA job before full upload.",
  },
  {
    id: "results",
    label: "Review site",
    caption: "Flights appear in the same site-detail surface, with scope requirements and QA status.",
  },
  {
    id: "correction",
    label: "Correction pass",
    caption: "A re-flown segment becomes a new version, so the review can focus on what changed.",
  },
  {
    id: "upload",
    label: "Deferred upload",
    caption: "After QA, the full photo upload can continue later from a better connection.",
  },
];

const SAMPLE_SITE_META: Record<string, SiteMeta> = {
  "clean-site": {
    siteId: "SITE-0427",
    inspectionId: "INSP-2026-00427",
    scope: "Tower Complete - Standard",
    location: "38.9072, -77.0369",
    date: "May 7, 2026",
  },
  "tower-site": {
    siteId: "SITE-1184",
    inspectionId: "INSP-2026-01184",
    scope: "Tower Heavy - Full Orbit Set",
    location: "38.9071, -77.0368",
    date: "May 7, 2026",
  },
  smoke: {
    siteId: "SITE-0008",
    inspectionId: "INSP-2026-00008",
    scope: "Smoke Test - Minimal Scope",
    location: "38.9073, -77.0367",
    date: "May 7, 2026",
  },
} as const;

const STATUS_LABEL: Record<FlightStatus, string> = {
  passed: "Passed",
  failed: "Failed",
  review: "Needs Review",
  not_required: "Not Required",
};

const STATUS_TEXT: Record<FlightStatus, string> = {
  passed: "text-green-700",
  failed: "text-red-700",
  review: "text-amber-700",
  not_required: "text-gray-500",
};

const STATUS_BADGE: Record<FlightStatus, string> = {
  passed: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  review: "bg-amber-100 text-amber-800 border-amber-200",
  not_required: "bg-gray-100 text-gray-700 border-gray-200",
};

function toFlightStatus(status: QaStatus): FlightStatus {
  if (status === "PASSED") return "passed";
  if (status === "FAILED") return "failed";
  return "review";
}

function formatCategory(value: string) {
  return value
    .replace(/[()]/g, "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTime(value: string | undefined, offsetMinutes: number) {
  const base = value ? new Date(value) : new Date("2026-05-07T09:00:00");
  const withOffset = new Date(base.getTime() + offsetMinutes * 60_000);
  return withOffset.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toModeledSiteFeet(rawAltitudeMeters: number) {
  const ratio = Math.max(rawAltitudeMeters, 0) / SITE_MODEL_SOURCE_REFERENCE_M;
  return Math.min(SITE_MODEL_MAX_HEIGHT_FT, ratio * SITE_MODEL_MAX_HEIGHT_FT);
}

function makeFlights(sample: Sample, stage: DemoStage): DemoFlight[] {
  const source = stage === "correction" || stage === "upload" ? correction : sample;

  return source.segments.map((segment, index) => {
    const startedAt = formatTime(source.timeRange.start, index * 3);
    const completedAt = formatTime(source.timeRange.start, index * 3 + 2);
    const rotation =
      segment.totalRotation === null ? "N/A" : `${Math.round(segment.totalRotation)} deg`;

    return {
      id: `${source.id}-${segment.id}`,
      name: segment.category,
      type: formatCategory(segment.rawCategory),
      status: toFlightStatus(segment.qaStatus),
      photoCount: segment.photoCount,
      duration: segment.photoCount > 80 ? "05:18" : segment.photoCount > 20 ? "02:34" : "00:42",
      startedAt,
      completedAt,
      version: segment.version,
      note: segment.note,
      source: segment,
      metrics: [
        {
          label: "Median Pitch",
          value: `${segment.medianPitch.toFixed(1)} deg`,
          status: toFlightStatus(segment.qaStatus),
        },
        {
          label: "Rotation",
          value: rotation,
          status:
            segment.totalRotation === null || segment.totalRotation >= 350 ? "passed" : "review",
        },
        {
          label: "Modeled Height",
          value: `${toModeledSiteFeet(segment.medianAltitude).toFixed(0)} ft`,
          status: "passed",
        },
      ],
    };
  });
}

function hasReviewableIssue(sample: Sample) {
  return getRequirementRows(sample, sample).some((row) => row.status !== "passed");
}

function getDemoRequiredCategories(sample: Sample) {
  if (sample.id === "clean-site") {
    return sample.requiredCategories.filter((required) => required.toLowerCase() !== "top down");
  }
  return sample.requiredCategories;
}

function getRequirementRows(sample: Sample, source: Sample) {
  return getDemoRequiredCategories(sample).map((required) => {
    const segment = source.segments.find(
      (item) => item.rawCategory.toLowerCase() === required.toLowerCase(),
    );
    const status = segment ? toFlightStatus(segment.qaStatus) : ("failed" as FlightStatus);
    return {
      label: formatCategory(required),
      status,
      reason: segment ? `${segment.photoCount} photos` : "Not detected",
    };
  });
}

export function DemoContainer() {
  const [stage, setStage] = useState<DemoStage>("ingest");
  const [selectedSampleId, setSelectedSampleId] = useState(samples[0].id);
  const [progress, setProgress] = useState(0);
  const [activeFlightId, setActiveFlightId] = useState<string | null>(null);
  const [queueExpanded, setQueueExpanded] = useState(false);

  const sample = samples.find((item) => item.id === selectedSampleId) ?? samples[0];
  const siteMeta = SAMPLE_SITE_META[sample.id as keyof typeof SAMPLE_SITE_META] ?? SAMPLE_SITE_META["clean-site"];
  const flights = useMemo(() => makeFlights(sample, stage), [sample, stage]);
  const activeFlight =
    flights.find((flight) => flight.id === activeFlightId) ?? flights[0];
  const requirementRows = getRequirementRows(
    sample,
    stage === "correction" || stage === "upload" ? correction : sample,
  );
  const issueCount = requirementRows.filter((row) => row.status !== "passed").length;
  const totalPhotos = flights.reduce((total, flight) => total + flight.photoCount, 0);

  useEffect(() => {
    if (stage !== "analyzing") return;
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const next = Math.min(100, ((now - startedAt) / 1800) * 100);
      setProgress(next);
      if (next < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => {
          setStage("results");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 250);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  const goToStage = (nextStage: DemoStage) => {
    if (nextStage === "ingest") {
      setActiveFlightId(null);
      setQueueExpanded(false);
      setProgress(0);
    }
    if (nextStage === "analyzing") {
      setProgress(0);
      setQueueExpanded(false);
    }
    setStage(nextStage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startAnalysis = () => goToStage("analyzing");
  const markCorrection = () => goToStage("correction");
  const queueUpload = () => {
    setQueueExpanded(true);
    goToStage("upload");
  };

  return (
    <div className="spotcheck-demo min-h-screen bg-[#f8fafc] text-[#030213]">
      <PortfolioHeader stage={stage} setStage={goToStage} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-8 md:px-6">
        <WalkthroughBar stage={stage} setStage={goToStage} />

        <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
          <div className="flex min-h-[720px] flex-col bg-white md:flex-row">
            <NavigationRail
              activeSiteId={siteMeta.siteId}
              samples={samples}
              selectedSampleId={selectedSampleId}
              setSelectedSampleId={(id) => {
                setSelectedSampleId(id);
                goToStage("ingest");
                setQueueExpanded(false);
              }}
            />

            <div className="relative flex min-w-0 flex-1 flex-col">
              <SiteHeader
                siteMeta={siteMeta}
                stage={stage}
                issueCount={issueCount}
                totalPhotos={totalPhotos}
                showCorrectionButton={stage === "results" && hasReviewableIssue(sample)}
                onCorrection={markCorrection}
                onQueue={queueUpload}
              />

              <div className="flex-1 overflow-y-auto bg-white">
                {stage === "ingest" ? (
                  <IngestView
                    sample={sample}
                    selectedSampleId={selectedSampleId}
                    setSelectedSampleId={setSelectedSampleId}
                    onStart={startAnalysis}
                  />
                ) : (
                  <SiteDetail
                    stage={stage}
                    sample={sample}
                    flights={flights}
                    activeFlight={activeFlight}
                    setActiveFlightId={setActiveFlightId}
                    onCorrection={markCorrection}
                    onQueue={queueUpload}
                  />
                )}
              </div>

              {stage === "analyzing" && <LoadingOverlay progress={progress} />}
            </div>
          </div>

          {(stage === "results" || stage === "correction" || stage === "upload") && (
            <UploadQueuePanel
              expanded={queueExpanded || stage === "upload"}
              totalPhotos={totalPhotos}
              stage={stage}
              setExpanded={setQueueExpanded}
              onQueue={queueUpload}
            />
          )}
        </div>

        <EvidenceFooter />
      </div>
    </div>
  );
}

function PortfolioHeader({
  stage,
  setStage,
}: {
  stage: DemoStage;
  setStage: (stage: DemoStage) => void;
}) {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-end md:justify-between md:px-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            case study / interactive demo
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-gray-950 md:text-3xl">
            SpotCheck - metadata-first QA for drone inspections
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            A demo version of the real SpotCheck frontend: select a site, drop a photo folder,
            run metadata QA, review required flights, handle a correction, and defer full upload.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setStage("ingest")}
          >
            Reset demo
          </button>
          <button
            className="rounded-md bg-[#030213] px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
            onClick={() => setStage(stage === "ingest" ? "analyzing" : "upload")}
          >
            {stage === "ingest" ? "Run QA" : "Jump to upload"}
          </button>
        </div>
      </div>
    </header>
  );
}

function WalkthroughBar({
  stage,
  setStage,
}: {
  stage: DemoStage;
  setStage: (stage: DemoStage) => void;
}) {
  const activeIndex = STAGES.findIndex((item) => item.id === stage);
  const caption = STAGES[activeIndex]?.caption ?? STAGES[0].caption;

  return (
    <div className="mt-5 rounded-lg border border-black/10 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {STAGES.map((item, index) => {
            const active = item.id === stage;
            const done = index < activeIndex;
            return (
              <button
                key={item.id}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-[#030213] bg-[#030213] text-white"
                    : done
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-black/10 bg-white text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setStage(item.id)}
              >
                {index + 1}. {item.label}
              </button>
            );
          })}
        </div>
        <p className="max-w-xl text-sm text-gray-600">{caption}</p>
      </div>
    </div>
  );
}

function NavigationRail({
  activeSiteId,
  samples,
  selectedSampleId,
  setSelectedSampleId,
}: {
  activeSiteId: string;
  samples: Sample[];
  selectedSampleId: string;
  setSelectedSampleId: (id: string) => void;
}) {
  const recent = samples.filter((sample) => sample.id !== selectedSampleId).slice(0, 2);

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-black/10 bg-[#fafafa] md:w-40 md:border-b-0 md:border-r">
      <div className="border-b border-black/10 px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
            JJ
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">Demo Pilot</div>
            <div className="text-[10px] text-gray-500">read-only</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <h3 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Sites
        </h3>
        <SidebarSection title="Active Today" count={1} open>
          <SiteButton label={activeSiteId} active onClick={() => setSelectedSampleId(selectedSampleId)} />
        </SidebarSection>

        <SidebarSection title="Assigned" count={samples.length}>
          {samples.map((sample) => {
            const meta = SAMPLE_SITE_META[sample.id as keyof typeof SAMPLE_SITE_META];
            return (
              <SiteButton
                key={sample.id}
                label={meta?.siteId ?? sample.name}
                active={sample.id === selectedSampleId}
                onClick={() => setSelectedSampleId(sample.id)}
              />
            );
          })}
        </SidebarSection>

        <SidebarSection title="Recent History" count={recent.length}>
          {recent.map((sample) => {
            const meta = SAMPLE_SITE_META[sample.id as keyof typeof SAMPLE_SITE_META];
            return (
              <SiteButton
                key={sample.id}
                label={meta?.siteId ?? sample.name}
                timestamp="09:42"
                onClick={() => setSelectedSampleId(sample.id)}
              />
            );
          })}
        </SidebarSection>
      </div>

      <div className="border-t border-black/10 p-3">
        <button className="w-full rounded-md px-2 py-2 text-left text-sm font-medium text-gray-500 hover:bg-gray-100">
          Logout
        </button>
      </div>
    </aside>
  );
}

function SidebarSection({
  title,
  count,
  children,
  open = true,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <div className="mb-3">
      <div className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        <span>{title}</span>
        {!open && <span>({count})</span>}
      </div>
      {open && <div className="space-y-1 px-2 pb-2">{children}</div>}
    </div>
  );
}

function SiteButton({
  label,
  active,
  timestamp,
  onClick,
}: {
  label: string;
  active?: boolean;
  timestamp?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-auto w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-xs font-medium transition-colors ${
        active ? "bg-[#030213] text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {timestamp && <span className="whitespace-nowrap text-[10px] opacity-70">{timestamp}</span>}
    </button>
  );
}

function SiteHeader({
  siteMeta,
  stage,
  issueCount,
  totalPhotos,
  showCorrectionButton,
  onCorrection,
  onQueue,
}: {
  siteMeta: SiteMeta;
  stage: DemoStage;
  issueCount: number;
  totalPhotos: number;
  showCorrectionButton: boolean;
  onCorrection: () => void;
  onQueue: () => void;
}) {
  const status = stage === "upload" ? "scope_passed" : stage === "correction" ? "in_progress" : "in_progress";

  return (
    <div className="border-b border-black/10 p-6">
      <div className="mb-4">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold text-gray-950">{siteMeta.siteId}</h2>
          <StageBadge stage={status} />
          {showCorrectionButton && (
            <button
              className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onCorrection}
            >
              Upload Correction
            </button>
          )}
          {(stage === "results" || stage === "correction") && (
            <button
              className="rounded-md bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-800 hover:bg-sky-200"
              onClick={onQueue}
            >
              Sort and move {totalPhotos} photos to local folders
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500">{siteMeta.date}</p>
      </div>

      <div className="mb-4">
        <StageIndicator active={stage === "upload" ? "delivered" : "qa"} />
      </div>

      <div className="space-y-2">
        <InfoRow label="Inspection ID" value={siteMeta.inspectionId} mono />
        <InfoRow label="Scope" value={siteMeta.scope} />
        <InfoRow label="Location" value={siteMeta.location} mono />
        <InfoRow
          label="Notes"
          value={
                issueCount > 0
              ? `${issueCount} metadata result${issueCount === 1 ? "" : "s"} need human review before full upload.`
              : "Metadata QA completed without required-flight gaps."
          }
        />
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: "in_progress" | "scope_passed" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        stage === "scope_passed"
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {stage === "scope_passed" ? "Scope Passed" : "In Progress"}
    </span>
  );
}

function StageIndicator({ active }: { active: "qa" | "delivered" }) {
  const steps = [
    { id: "qa", label: "QA Review" },
    { id: "qc", label: "QC Review" },
    { id: "delivered", label: "Delivered" },
  ];
  const activeIndex = active === "delivered" ? 2 : 0;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <div
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              index <= activeIndex
                ? item.id === "qa"
                  ? "bg-yellow-100 text-yellow-800"
                  : item.id === "qc"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {item.label}
          </div>
          {index < steps.length - 1 && (
            <div className={`mx-0.5 h-0.5 w-4 ${index < activeIndex ? "bg-green-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-sm text-gray-500">{label}: </span>
      <span className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function IngestView({
  sample,
  selectedSampleId,
  setSelectedSampleId,
  onStart,
}: {
  sample: Sample;
  selectedSampleId: string;
  setSelectedSampleId: (id: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="flex min-h-[470px] flex-col justify-end">
      <div className="flex-1 p-6">
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow-sm">
            <span aria-hidden>+</span>
          </div>
          <h3 className="text-lg font-medium">No flights recorded for this site inspection</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
            This demo uses bundled, redacted fixture data. Pick a sample folder below, then run
            the same metadata-first QA pass the real frontend coordinates.
          </p>
        </div>
      </div>

      <div className="border-t border-black/10 bg-white p-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400">
            <div className="mb-2 text-sm font-medium">Drag here to upload photos</div>
            <p className="text-sm text-gray-500">
              Demo mode: choose one of the sample SD-card folders.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {samples.map((item) => (
              <button
                key={item.id}
                className={`rounded-md border p-3 text-left transition-colors ${
                  item.id === selectedSampleId
                    ? "border-[#030213] bg-gray-50"
                    : "border-black/10 bg-white hover:bg-gray-50"
                }`}
                onClick={() => setSelectedSampleId(item.id)}
              >
                <div className="text-sm font-medium">{item.name.replace(/\s+.*/, "")}</div>
                <div className="mt-1 text-xs leading-5 text-gray-500">{item.photoCount} photos</div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              Selected: <span className="font-medium text-gray-950">{sample.name}</span>
            </div>
            <button
              className="rounded-md bg-[#030213] px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              onClick={onStart}
            >
              Submit metadata analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SiteDetail({
  stage,
  sample,
  flights,
  activeFlight,
  setActiveFlightId,
  onCorrection,
  onQueue,
}: {
  stage: DemoStage;
  sample: Sample;
  flights: DemoFlight[];
  activeFlight: DemoFlight | undefined;
  setActiveFlightId: (id: string) => void;
  onCorrection: () => void;
  onQueue: () => void;
}) {
  return (
    <div className="p-6 pb-24">
      <ScopeRequirements stage={stage} sample={sample} />

      {stage === "correction" || stage === "upload" ? (
        <DiffView flights={flights} />
      ) : (
        <>
          <h3 className="mb-4 text-lg font-medium">Flights</h3>
          <div className="space-y-3">
            {flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                open={flight.id === activeFlight?.id}
                onClick={() => setActiveFlightId(flight.id)}
              />
            ))}
          </div>
        </>
      )}

      {stage === "results" && hasReviewableIssue(sample) && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-medium text-amber-950">Reshoot opportunity detected</div>
              <p className="mt-1 text-sm text-amber-800">
                The pilot can re-fly the ambiguous segment before leaving the route.
              </p>
            </div>
            <button
              className="rounded-md bg-[#030213] px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
              onClick={onCorrection}
            >
              Mark for reshoot
            </button>
          </div>
        </div>
      )}

      {stage === "correction" && (
        <div className="mt-4 flex justify-end">
          <button
            className="rounded-md bg-[#030213] px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            onClick={onQueue}
          >
            Submit and queue upload
          </button>
        </div>
      )}
    </div>
  );
}

function ScopeRequirements({ stage, sample }: { stage: DemoStage; sample: Sample }) {
  const source = stage === "correction" || stage === "upload" ? correction : sample;
  const requirements = getRequirementRows(sample, source);
  const complete = requirements.filter((item) => item.status === "passed");
  const hasReview = requirements.some((item) => item.status === "review");
  const overall =
    complete.length === requirements.length ? "Complete" : hasReview ? "Pending Review" : "Incomplete";

  return (
    <div className="mb-4 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Scope Requirements</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {complete.length} of {requirements.length} requirements met
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            overall === "Complete"
              ? "bg-green-600 text-white"
              : overall === "Pending Review"
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {overall}
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {requirements.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 rounded-md border p-2 ${STATUS_BADGE[item.status]}`}
          >
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/70 text-[10px]">
              {item.status === "passed" ? "ok" : "!"}
            </span>
            <div className="min-w-0">
              <span className="block truncate text-xs font-medium">{item.label}</span>
              <span className="block truncate text-[10px] opacity-75">{item.reason}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlightCard({
  flight,
  open,
  onClick,
}: {
  flight: DemoFlight;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        className="flex w-full items-center justify-between gap-3 rounded-t-lg px-4 py-3 text-left hover:bg-gray-50"
        onClick={onClick}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="text-gray-500">{open ? "v" : ">"}</span>
          <span className="font-medium">{flight.name}</span>
          {flight.version && (
            <span className="rounded-md border border-black/10 px-1.5 py-0.5 text-xs text-gray-600">
              v{flight.version}
            </span>
          )}
          <span className="text-sm text-gray-500">{flight.photoCount} photos</span>
          <span className={`text-sm font-medium ${STATUS_TEXT[flight.status]}`}>
            {STATUS_LABEL[flight.status]}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-black/10 px-4 pb-4 pt-3">
          <div className="mb-3 grid grid-cols-3 gap-4">
            <MiniInfo label="Duration" value={flight.duration} />
            <MiniInfo label="Started" value={flight.startedAt} />
            <MiniInfo label="Completed" value={flight.completedAt} />
          </div>

          <MiniInfo label="Flight Type" value={flight.type} />

          <div className="mt-4">
            <h4 className="mb-3 text-sm font-medium text-gray-500">Analysis Metrics</h4>
            <div className="grid gap-3 md:grid-cols-3">
              {flight.metrics.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-gray-500">{metric.label}</p>
                    <p className="text-sm font-medium">{metric.value}</p>
                  </div>
                  <span className={`ml-2 rounded px-1.5 py-0.5 text-xs ${STATUS_BADGE[metric.status]}`}>
                    {STATUS_LABEL[metric.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-black/10 pt-4">
            <FlightPathModel segment={flight.source} embedded heightClass="h-[380px]" />
          </div>

          {flight.status === "review" && (
            <div className="mt-4 rounded-md bg-amber-50 p-2">
              <p className="text-xs font-medium text-amber-700">Review Reason</p>
              <p className="text-sm text-amber-800">{flight.source.rule}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function DiffView({ flights }: { flights: DemoFlight[] }) {
  const replacement = flights.find((flight) => flight.version === 2) ?? flights[0];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-black/10 bg-white p-3 shadow-sm">
        <button className="mb-1 flex w-full items-center gap-3 rounded border border-[#030213] bg-gray-50 px-3 py-2 text-left text-xs">
          <span className="font-mono text-gray-500">#2</span>
          <span className="font-medium">Re-flown after gimbal-angle review</span>
          <span className="rounded border border-amber-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-amber-700">
            correction
          </span>
          <span className="ml-auto font-mono text-gray-500">10:42</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-xs hover:bg-gray-50">
          <span className="font-mono text-gray-500">#1</span>
          <span className="font-medium">Initial upload</span>
          <span className="rounded border border-black/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-500">
            upload
          </span>
          <span className="ml-auto font-mono text-gray-500">09:42</span>
        </button>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Diff vs. previous submission
        </h3>
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              replaced
            </span>
            <span className="text-sm font-medium">{replacement.name}</span>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <DiffCell
              label="before"
              name="Needs review (gimbal angle)"
              status="review"
              detail="31 photos / pitch -30.0 deg / ambiguous category"
            />
            <DiffCell
              label="after"
              name={replacement.name}
              status={replacement.status}
              detail={`${replacement.photoCount} photos / pitch ${replacement.source.medianPitch.toFixed(1)} deg / v2`}
            />
          </div>
        </div>
      </div>

      <h3 className="mb-4 text-lg font-medium">Flights</h3>
      <div className="space-y-3">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} open={flight.version === 2} onClick={() => undefined} />
        ))}
      </div>
    </div>
  );
}

function DiffCell({
  label,
  name,
  status,
  detail,
}: {
  label: string;
  name: string;
  status: FlightStatus;
  detail: string;
}) {
  return (
    <div className="rounded border border-black/10 bg-white p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wide text-gray-500">{label}</span>
        <span className={`rounded px-1.5 py-0.5 text-xs ${STATUS_BADGE[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <div className="text-sm font-medium">{name}</div>
      <div className="mt-1 text-xs text-gray-500">{detail}</div>
    </div>
  );
}

function LoadingOverlay({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#030213]" />
        <p className="text-lg font-medium">Analyzing flight data...</p>
        <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}

function UploadQueuePanel({
  expanded,
  totalPhotos,
  stage,
  setExpanded,
  onQueue,
}: {
  expanded: boolean;
  totalPhotos: number;
  stage: DemoStage;
  setExpanded: (expanded: boolean) => void;
  onQueue: () => void;
}) {
  const complete = stage === "upload";
  const status = complete
    ? `Upload complete: ${totalPhotos} photos`
    : `${totalPhotos} photos pending upload`;

  return (
    <div className="border-t border-black/10 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${complete ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}>
            {complete ? "Complete" : "Pending"}
          </span>
          <span className="text-sm font-medium">{status}</span>
        </div>
        <span className="text-sm text-gray-500">{expanded ? "Hide" : "Show"}</span>
      </button>

      {expanded && (
        <div className="border-t border-black/10 px-4 py-4">
          {!complete && (
            <div className="mb-4 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
              <p className="text-sm font-medium">Drop your photo folder here to start uploading</p>
              <p className="mt-1 text-xs text-gray-500">Same folder used during analysis</p>
            </div>
          )}

          <div className="mb-4 h-3 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full bg-green-600" style={{ width: complete ? "100%" : "0%" }} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!complete && (
              <button
                className="rounded-md bg-[#030213] px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                onClick={onQueue}
              >
                Upload {totalPhotos} Photos
              </button>
            )}
            <button
              className="ml-auto rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
              onClick={() => setExpanded(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceFooter() {
  return (
    <div className="max-w-4xl text-xs leading-5 text-gray-500">
      Demo data is bundled and redacted. The UI mirrors the private SpotCheck frontend shape while
      avoiding real customer names, coordinates, auth state, and backend calls.
    </div>
  );
}
