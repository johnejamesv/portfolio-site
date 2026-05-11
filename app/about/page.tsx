import Link from "next/link";

export const metadata = {
  title: "About — John James",
  description:
    "John James builds software for messy operational workflows, drawing from field QA, drone inspections, process engineering, and AI-assisted systems work.",
};

type Role = {
  title: string;
  company: string;
  companyHref?: string;
  location: string;
  range: string;
  paragraphs: string[];
};

const roles: Role[] = [
  {
    title: "Manufacturing Domain Expert / Structured Output Writer",
    company: "Mercor",
    location: "Remote",
    range: "2025 — Present",
    paragraphs: [
      "Manufacturing and process engineering domain expertise for AI training data projects. Separate structured-output writing work for model evaluation projects. Work performed under NDA.",
    ],
  },
  {
    title: "Lead Engineer & Architect — SpotCheck",
    company: "Mechanical Vision Solutions",
    location: "Remote · Japan",
    range: "2023 — Present",
    paragraphs: [
      "Architected and built SpotCheck, a cloud-native platform that automates QA for drone-based cell tower inspections, replacing a manual process where engineers visually reviewed thousands of photos by subjective judgment.",
      "Built FlightSorter, a heuristic engine that classifies complex flight patterns from multimodal sensor data (gimbal pitch, yaw, GPS, barometric altitude, airspeed): time-gap segmentation, orbit detection, tower flight disassembly, and inward/outward orientation determination.",
      "Designed tolerance-based QA so the system avoids false-failing experienced pilots on criteria that can't be reliably measured from metadata alone — pass exceptions auto-approve, thresholds tuned regressively against real pilot data.",
      "Engineered async data ingestion (FastAPI + Cloud Storage) for 5,000+ image jobs with chunked resumable uploads, plus client-side EXIF parsing so pilots can dump an SD card and check from local metadata before full upload.",
    ],
  },
  {
    title: "Drone Inspection QA Lead & Pilot",
    company: "Mechanical Vision Solutions",
    location: "Field · United States",
    range: "2021 — Present",
    paragraphs: [
      "QA lead for high-volume drone inspections supporting major telecom clients. Analyzed pilot telemetry and image quality against strict 3D modeling engineering requirements.",
      "Completed 500+ site inspections under hard daily constraints — 10 sites/day, 1-hour windows, FAA Part 107 daylight limits. Sites ranged from remote tower compounds to secured urban buildings (hospitals, commercial rooftops) requiring on-the-fly access problem-solving and real-time schedule re-optimization.",
      "Mapped implicit expert QA knowledge (gimbal angles, orbit completeness, photo counts) into explicit software rules. That field judgment became the foundation for SpotCheck's FlightSorter engine.",
      "Built a multi-platform browser automation suite (Playwright) that coordinates workflows across three internal platforms — replacing manual cross-platform data entry with automated session management and turn-in processing. Runs as a daemon with AI-assisted monitoring for unattended operation.",
    ],
  },
  {
    title: "Process Engineer",
    company: "INEOS Olefins and Polymers",
    location: "Chocolate Bayou, TX · Ethylene production",
    range: "Jun 2016 — Jun 2020",
    paragraphs: [
      "Interfaced with contractors on an $800MM ethylene-production Capacity Expansion Project; performed scope changes that cut $1MM from small capital projects.",
      "Developed VBA calculation tools for piping/vessel fracture assessment and modeled dynamic overpressure scenarios in Aspen HYSYS.",
      "Led unit operation field walks, directed catalyst change-outs, and performed feasibility analysis on design concepts saving up to $5MM in capital costs.",
      "Acted as Process Engineer for Process Hazard Analysis (PHA) and managed change processes for large-scale expansions.",
    ],
  },
];

const skillGroups: { title: string; items: string[] }[] = [
  {
    title: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "SQL", "VBA"],
  },
  {
    title: "Web & APIs",
    items: ["FastAPI", "React", "Next.js", "Zustand", "TanStack Query", "HTMX"],
  },
  {
    title: "AI / Eval",
    items: [
      "LangGraph",
      "Pydantic",
      "Anthropic API",
      "OpenAI API",
      "Vertex AI / Gemini",
      "Playwright agents",
    ],
  },
  {
    title: "Cloud & DevOps",
    items: [
      "Google Cloud Platform",
      "Cloud Run / Cloud SQL / Cloud Storage",
      "Terraform",
      "Docker",
      "GitHub Actions",
    ],
  },
  {
    title: "Data",
    items: [
      "PostgreSQL",
      "SQLAlchemy",
      "Geospatial analysis",
      "Telemetry pipelines",
      "EXIF / metadata",
    ],
  },
  {
    title: "Engineering",
    items: [
      "Aspen HYSYS",
      "3D modeling QA",
      "FAA Part 107 Remote Pilot",
      "Process Hazard Analysis",
    ],
  },
];

const education = [
  {
    school: "Lamar University",
    degree: "B.S. Chemical Engineering",
    location: "Beaumont, TX",
  },
];

const certificates = [
  {
    school: "DeepLearning.AI · Coursera",
    degree:
      "Deep Learning Specialization · Machine Learning Specialization",
    location: "Andrew Ng",
  },
  {
    school: "Additional AI coursework",
    degree: "Agentic AI, prompt engineering, JAX / LLM training",
    location: "DeepLearning.AI · Coursera",
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      <Hero />
      <Bio />
      <Experience />
      <Skills />
      <Education />
      <Certificates />
      <Closer />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 md:px-10 pt-20 md:pt-28 pb-12">
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[18vw] md:text-[14vw] leading-none tracking-tight text-[var(--foreground)]/[0.04]"
          >
            About
          </div>

          <div className="relative flex flex-col items-center text-center gap-4">
            <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
              about
            </span>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight max-w-3xl">
              I build software for messy operational work.
            </h1>
            <p className="text-base md:text-lg text-[var(--muted)] max-w-2xl leading-relaxed mt-2">
              The shortest version: 500+ drone inspections, process-engineering roots, and a
              habit of turning field judgment into systems that are easier to trust.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bio() {
  return (
    <section className="max-w-3xl mx-auto px-5 md:px-10 pb-12 md:pb-16">
      <div className="flex flex-col gap-4 text-base leading-relaxed text-[var(--foreground)]/90">
        <p>
          I came to software through process engineering. At INEOS, I supported an approximately
          $800MM ethylene expansion and participated in 10+ Process Hazard Analyses. That job
          trained me to think in failure modes, tolerances, and field reality, not aspirational
          specs.
        </p>
        <p>
          Then I went into the field. As an FAA Part 107 pilot doing telecom inspections, I flew
          500+ sites under hard daily constraints (10 sites/day, 1-hour windows, daylight limits).
          I noticed QA engineers were evaluating thousands of photos by subjective visual review
          with no standardized criteria, so I started turning the implicit expert rules into
          software. That became SpotCheck.
        </p>
        <p>
          Today I work at the intersection of operations and AI: building cloud-native QA systems,
          browser-automation orchestrators for human-in-the-loop review, and evaluation pipelines
          that treat AI generation as a provenance and verification problem. The common thread is
          the same: messy real-world workflows turned into software that scales without losing the
          judgment.
        </p>
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section className="max-w-5xl mx-auto px-5 md:px-10 py-12 md:py-16">
      <div className="flex flex-col gap-2 mb-10">
        <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
          experience
        </span>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">Work history.</h2>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="absolute left-4 md:left-[200px] top-2 bottom-2 w-px bg-[var(--border)]"
        />

        <div className="flex flex-col gap-12 md:gap-16">
          {roles.map((role, i) => (
            <RoleEntry key={i} role={role} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RoleEntry({ role }: { role: Role }) {
  return (
    <article className="relative grid md:grid-cols-[200px_1fr] gap-4 md:gap-10">
      <div className="absolute left-4 md:left-[200px] top-2 -translate-x-1/2 grid place-items-center">
        <span className="block h-3 w-3 rounded-full bg-[var(--background)] border-2 border-[var(--accent)]" />
      </div>

      <div className="pl-10 md:pl-0 md:pr-2 md:text-right flex flex-col gap-1">
        <div className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
          {role.range}
        </div>
        <div className="text-xs font-mono text-[var(--muted)]/80">{role.location}</div>
      </div>

      <div className="pl-10 md:pl-12 flex flex-col gap-3">
        <header className="flex flex-col gap-1">
          <h3 className="font-display text-2xl md:text-[1.7rem] leading-tight tracking-tight text-[var(--foreground)]">
            {role.title}
          </h3>
          <div className="text-sm text-[var(--muted)]">
            {role.companyHref ? (
              <Link
                href={role.companyHref}
                className="text-[var(--accent-2)] hover:underline"
              >
                {role.company}
              </Link>
            ) : (
              <span className="text-[var(--accent-2)]">{role.company}</span>
            )}
          </div>
        </header>
        <div className="flex flex-col gap-3 text-sm md:text-base text-[var(--foreground)]/85 leading-relaxed">
          {role.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </article>
  );
}

function Skills() {
  return (
    <section className="max-w-5xl mx-auto px-5 md:px-10 py-12 md:py-16 border-t border-[var(--border)]">
      <div className="flex flex-col gap-2 mb-10">
        <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
          stack
        </span>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">
          Tools and domains.
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {skillGroups.map((g) => (
          <div
            key={g.title}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/60 p-5 flex flex-col gap-3"
          >
            <h3 className="text-xs font-mono text-[var(--accent-2)] uppercase tracking-wider">
              {g.title}
            </h3>
            <ul className="flex flex-col gap-1.5">
              {g.items.map((item) => (
                <li key={item} className="text-sm text-[var(--foreground)]/85">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Education() {
  return (
    <section className="max-w-5xl mx-auto px-5 md:px-10 py-12 md:py-16 border-t border-[var(--border)]">
      <div className="flex flex-col gap-2 mb-10">
        <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
          education
        </span>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">Education.</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {education.map((e) => (
          <div
            key={e.school}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/60 p-6 flex flex-col gap-1"
          >
            <h3 className="font-display text-xl text-[var(--foreground)]">{e.school}</h3>
            <p className="text-sm text-[var(--accent-2)]">{e.degree}</p>
            <p className="text-xs font-mono text-[var(--muted)] mt-1">{e.location}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Certificates() {
  return (
    <section className="max-w-5xl mx-auto px-5 md:px-10 py-12 md:py-16 border-t border-[var(--border)]">
      <div className="flex flex-col gap-2 mb-10">
        <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
          certificates
        </span>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">Formal learning.</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {certificates.map((certificate) => (
          <div
            key={certificate.school}
            className="rounded-xl border border-[var(--border)] bg-[var(--panel)]/60 p-6 flex flex-col gap-1"
          >
            <h3 className="font-display text-xl text-[var(--foreground)]">{certificate.school}</h3>
            <p className="text-sm text-[var(--accent-2)]">{certificate.degree}</p>
            <p className="text-xs font-mono text-[var(--muted)] mt-1">{certificate.location}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Closer() {
  return (
    <section className="max-w-3xl mx-auto px-5 md:px-10 py-16 md:py-24 text-center flex flex-col gap-5">
      <h2 className="font-display text-3xl md:text-4xl tracking-tight">
        Want to see the systems?
      </h2>
      <p className="text-base text-[var(--muted)] leading-relaxed">
        The fastest way to understand the work is to try an interactive demo, then read the
        writeup if the shape of the system is useful.
      </p>
      <div className="flex items-center justify-center gap-3 mt-2">
        <Link
          href="/"
          className="rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 px-5 py-2 text-sm font-medium text-[var(--accent-2)] transition-colors"
        >
          See the work →
        </Link>
        <a
          href="mailto:john.james9007@gmail.com"
          className="rounded-full border border-[var(--border)] hover:border-[var(--muted)] px-5 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Get in touch
        </a>
      </div>
    </section>
  );
}
