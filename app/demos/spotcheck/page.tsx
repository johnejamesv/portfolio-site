import { DemoContainer } from "@/components/spotcheck/DemoContainer";
import {
  ProofGrid,
  StackList,
  Writeup,
  WriteupHeader,
  WriteupSection,
} from "@/components/Writeup";

export const metadata = {
  title: "SpotCheck — Metadata-First QA for Drone Inspections | John James",
  description:
    "Drone inspection QA platform that classifies flight patterns and detects missing capture from local EXIF and telemetry, before full upload.",
};

export default function SpotCheckDemo() {
  return (
    <>
      <main className="flex-1">
        <DemoContainer />
      </main>

      <Writeup>
        <WriteupHeader
          eyebrow="case study"
          title="Metadata-first QA for drone inspections"
          lede="The hard part wasn't the stack. It was defining what 'correct' meant from real
          inspection experience: gimbal angles, orbit coverage, altitude bands, photo spacing, and
          the difference between a field exception and a true failed capture."
        />

        <WriteupSection title="The problem">
          <p>
            Drone pilots spend daylight on capture, then sort photos later from a hotel, home, or
            staging location before upload. That post-flight sorting step is tedious, failure-prone,
            and full of manual retries because pilots are moving thousands of high-resolution
            photos through a connection that isn&apos;t built for it.
          </p>
          <p>
            The quality failure usually arrives <em>after</em> that delayed sort/upload/review
            cycle. Even in a fast case, the pilot may not learn about a failed orbit, bad angle,
            incomplete tower pass, or weak capture sequence until the next day. By then the pilot
            may already be packed into the next route, scheduled elsewhere, or too far away to
            reshoot cheaply. A field correction turns into rescheduling pain and real cost.
          </p>
        </WriteupSection>

        <WriteupSection title="Constraints">
          <ul className="flex flex-col gap-2 list-disc list-outside pl-5 marker:text-[var(--muted)]">
            <li>Pilots may handle thousands of high-resolution images per job.</li>
            <li>Daylight is for capture; sorting and upload happen later.</li>
            <li>Manual sorting is tedious and easy to get wrong.</li>
            <li>Full-file upload is slow, interrupted, and retry-heavy.</li>
            <li>A fail signal that arrives 24+ hours later may be too late for a cheap reshoot.</li>
            <li>A quality gate cannot hard-stop experienced pilots every time metadata looks unusual &mdash; field conditions vary.</li>
            <li>The first useful signal should come from metadata and telemetry, with visual AI used only where metadata cannot answer the question.</li>
          </ul>
        </WriteupSection>

        <WriteupSection title="Approach">
          <p>
            SpotCheck treats upload as something to <em>queue</em>, not the first gate. The pilot
            dumps the SD card as-is. The browser extracts EXIF and flight metadata from local
            files, uses filepaths to sort and track photos, and runs metadata-first checks before
            the full image set has to move over the network.
          </p>
          <p>
            Once metadata is extracted, SpotCheck classifies flight patterns, identifies missing
            capture, and prepares the upload queue for later from a better connection. The backend
            normalizes metadata, runs serial QA analyzers, stores results, and sends pass/fail
            feedback back to the pilot-facing UI.
          </p>
          <p className="text-[var(--muted)]">
            The system starts with deterministic rules because most inspection failures have
            structured signatures: gimbal pitch, yaw/rotation, altitude, image width, timestamps,
            and GPS-derived movement. Visual AI is reserved for cases where telemetry alone is
            insufficient.
          </p>
        </WriteupSection>

        <WriteupSection title="The pilot workflow becomes">
          <ol className="flex flex-col gap-2 list-decimal list-outside pl-5 marker:text-[var(--muted)] marker:font-mono">
            <li>Dump the SD card.</li>
            <li>Extract metadata from local files.</li>
            <li>Sort/check flights from telemetry and EXIF before full upload.</li>
            <li>Identify missing or weak flight categories early enough to make a reshoot decision.</li>
            <li>Queue full-file upload for later when connection quality is better.</li>
            <li>Preserve human override and review trail for edge cases.</li>
          </ol>
        </WriteupSection>

        <WriteupSection title="Proof points">
          <ProofGrid
            items={[
              { label: "field experience", value: "500+ inspections" },
              { label: "ingest path", value: "SD-card dump → metadata" },
              { label: "first QA signal", value: "before full upload" },
              { label: "designed for jobs of", value: "5,000+ images" },
              { label: "FlightSorter test pass", value: "71 / 71" },
              { label: "human override", value: "preserved" },
            ]}
          />
        </WriteupSection>

        <WriteupSection title="Stack">
          <StackList
            items={[
              "React + TypeScript",
              "Vite",
              "Zustand + TanStack Query",
              "Radix UI",
              "FastAPI + Python",
              "SQLAlchemy + Pydantic",
              "PostgreSQL",
              "Docker + Terraform",
              "GCP (Cloud Run, Cloud Storage)",
              "GitHub Actions",
            ]}
          />
        </WriteupSection>

        <WriteupSection title="Boundaries">
          <p className="text-sm text-[var(--muted)]">
            The accurate claim is that I identified the field problem from 500+ drone inspections,
            specified the system, directed and reviewed implementation, verified behavior, and own
            the architecture and judgment encoded in the product. This isn&apos;t presented as a
            measured retrip-reduction case &mdash; the practical signal is that the first
            failure-feedback moment now happens after the SD-card dump instead of after delayed
            upload and review.
          </p>
        </WriteupSection>
      </Writeup>
    </>
  );
}
