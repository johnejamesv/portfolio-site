import Image from "next/image";
import Link from "next/link";

type CaseStudy = {
  href: string;
  index: string;
  eyebrow: string;
  title: string;
  blurb: string;
  bullets: string[];
  thumbnail?: string;
  cta?: string;
};

const studies: CaseStudy[] = [
  {
    href: "/demos/spotcheck",
    index: "01",
    eyebrow: "drone QA · field-to-software",
    title: "SpotCheck — metadata-first QA for drone inspections",
    blurb:
      "Drop an SD-card dump, sort and check by metadata before upload, and reshoot before the route moves. Built from 500+ inspections of field judgment.",
    bullets: [
      "First QA signal before full upload",
      "Designed for jobs of 5,000+ images",
      "Human override preserved at every stage",
    ],
    thumbnail: "/spotcheck-metadata-thumbnail.png",
  },
  {
    href: "/demos/spiderzz",
    index: "02",
    eyebrow: "browser automation · ops",
    title: "SpiderZZ — human-in-the-loop QA orchestrator",
    blurb:
      "Telecom inspection QA used to mean juggling three platforms per site. SpiderZZ turns that into a prepared queue. Try the manual workflow yourself and see why the throughput problem is structural.",
    bullets: [
      "~25 min/site → <4 min/site",
      "100-site batch from days to hours",
      "Reviewer keeps the pass/fail call",
    ],
    thumbnail: "/spiderzz-chatgpt-thumbnail.png",
  },
  {
    href: "/case-studies/spotcheck-hybrid-visual-verification-pipeline",
    index: "03",
    eyebrow: "computer vision · inspection QA",
    title: "SpotCheck hybrid visual verification pipeline",
    blurb:
      "A public-safe case study of SpotCheck's visual verifier: OCR anchors, VLM fallback, structured JSON records, and a human review queue for uncertain field-photo evidence.",
    bullets: [
      "EasyOCR anchor pass + Florence-2 extraction",
      "18 / 18 visible positions detected",
      "Partial and needs-review records preserved",
    ],
    thumbnail: "/spotcheck-hybrid-visual-verification-composite.png",
    cta: "read case study",
  },
  {
    href: "/demos/evidence-grounded",
    index: "04",
    eyebrow: "ai evaluation · provenance",
    title: "Evidence-grounded AI evaluation pipeline",
    blurb:
      "A LangGraph pipeline that treats writing as an evaluation problem. Watch the red-team reviewer catch an unsupported metric and pull it from export.",
    bullets: [
      "Provenance carried in the schema",
      "Coverage map: strong / weak / adjacent / missing",
      "Adversarial review can hard-fail bullets",
    ],
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <CaseStudies />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 md:px-10 pt-24 md:pt-32 pb-20 md:pb-28">
        <div className="relative">
          {/* Watermark name */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 md:-top-14 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[18vw] md:text-[14vw] leading-none tracking-tight text-[var(--foreground)]/[0.04]"
          >
            John James
          </div>

          <div className="relative flex flex-col items-center text-center gap-5">
            <span className="text-xs font-mono text-[var(--muted)] tracking-wider uppercase">
              applied AI systems engineer · Kanagawa, JP
            </span>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl">
              Field-to-software automation for
              <br className="hidden md:block" /> messy operational workflows.
            </h1>
            <p className="text-base md:text-lg text-[var(--muted)] max-w-2xl leading-relaxed mt-2">
              Selected work below: three interactive demos plus a case study on the visual
              verification architecture inside SpotCheck.
            </p>

            <div className="flex items-center gap-3 mt-2">
              <Link
                href="#work"
                className="rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 px-5 py-2 text-sm font-medium text-[var(--accent-2)] transition-colors"
              >
                See the work →
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-[var(--border)] hover:border-[var(--muted)] px-5 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CaseStudies() {
  return (
    <section id="work" className="max-w-5xl mx-auto px-5 md:px-10 py-20 md:py-28 flex flex-col gap-14">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
          selected work
        </span>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight">
          Selected systems and case studies.
        </h2>
      </div>

      <div className="flex flex-col gap-10 md:gap-14">
        {studies.map((s, i) => (
          <CaseStudyCard key={s.href} study={s} flip={i % 2 === 1} priority={i === 0} />
        ))}
      </div>
    </section>
  );
}

function CaseStudyCard({
  study,
  flip,
  priority = false,
}: {
  study: CaseStudy;
  flip?: boolean;
  priority?: boolean;
}) {
  return (
    <Link
      href={study.href}
      className="group block rounded-2xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden hover:border-[var(--accent)]/60 hover:bg-[var(--panel)]/80 transition-colors"
    >
      <div className={`grid md:grid-cols-2 gap-0 ${flip ? "md:[direction:rtl]" : ""}`}>
        <div className="p-6 md:p-9 flex flex-col gap-4 md:[direction:ltr] min-w-0">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-[var(--accent-2)]">{study.index}</span>
            <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider">
              {study.eyebrow}
            </span>
          </div>
          <h3 className="font-display text-2xl md:text-3xl leading-tight tracking-tight group-hover:text-[var(--accent-2)] transition-colors">
            {study.title}
          </h3>
          <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed">{study.blurb}</p>
          <ul className="flex flex-col gap-1.5 mt-1">
            {study.bullets.map((b, i) => (
              <li key={i} className="text-sm text-[var(--foreground)]/85 flex gap-2">
                <span className="text-[var(--accent-2)] shrink-0">·</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1 text-sm font-mono text-[var(--accent-2)] mt-2">
            <span>{study.cta ?? "open demo"}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>

        <div className="relative md:[direction:ltr] aspect-[16/10] md:aspect-auto md:min-h-[280px] border-t md:border-t-0 md:border-l border-[var(--border)] bg-[var(--panel-2)] overflow-hidden">
          {study.thumbnail ? (
            <Image
              src={study.thumbnail}
              alt=""
              fill
              priority={priority}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300"
            />
          ) : (
            <PlaceholderArt index={study.index} />
          )}
        </div>
      </div>
    </Link>
  );
}

function PlaceholderArt({ index }: { index: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[var(--panel-2)] via-[var(--panel)] to-[var(--background)]">
      <div className="absolute inset-0 opacity-20" aria-hidden>
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 250">
          <defs>
            <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={i * 32}
              x2="400"
              y2={i * 32 - 60}
              stroke={`url(#grad-${index})`}
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>
      <span className="relative font-display text-[7rem] leading-none text-[var(--foreground)]/10">
        {index}
      </span>
    </div>
  );
}
