import Image from "next/image";
import {
  ProofGrid,
  StackList,
  Writeup,
  WriteupHeader,
  WriteupSection,
} from "@/components/Writeup";

export const metadata = {
  title: "Evidence-Grounded AI Evaluation Pipeline | John James",
  description:
    "Case study of a LangGraph pipeline that treats AI text generation as an evaluation problem: provenance-linked claims, coverage maps, and adversarial review that rejects unsupported content before export.",
};

export default function EvidenceGroundedCaseStudy() {
  return (
    <>
      <main className="flex-1">
        <section className="px-5 md:px-10 py-10 md:py-16">
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            <header className="max-w-3xl flex flex-col gap-4">
              <span className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
                case study
              </span>
              <h1 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight">
                Evidence-grounded AI evaluation pipeline
              </h1>
              <p className="text-base md:text-lg text-[var(--muted)] leading-relaxed max-w-2xl">
                A LangGraph pipeline that treats AI text generation as an evaluation problem.
                Resume bullets are the surface; the interesting layer is what the system refuses to
                export when the evidence doesn&apos;t back the claim.
              </p>
            </header>

            <figure className="flex flex-col gap-3">
              <div className="relative aspect-[2/3] max-w-md mx-auto w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel-2)]">
                <Image
                  src="/evidence-grounded-thumbnail.png"
                  alt="Pipeline diagram: source documents flow into evidence items, coverage map, drafted bullets, red-team review, and export, with rejected items routed back for review."
                  fill
                  priority
                  sizes="(min-width: 768px) 448px, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="text-xs text-[var(--muted)] leading-relaxed max-w-3xl">
                Source documents become evidence items with excerpts, requirements get coverage
                ratings, bullets carry evidence IDs forward, and an adversarial reviewer can hard-fail
                items that don&apos;t hold up before they reach export.
              </figcaption>
            </figure>
          </div>
        </section>
      </main>

      <Writeup>
        <WriteupHeader
          eyebrow="case study"
          title="Provenance-first AI writing as an evaluation problem"
          lede="The accurate framing isn't &ldquo;AI writes a resume.&rdquo; It's: given source material and a target role, the system has to distinguish supported claims from plausible-sounding unsupported ones — and refuse to fabricate the bridge when the evidence isn't there."
        />

        <WriteupSection title="The problem">
          <p>
            Generic AI writing tools fail in predictable ways. They write from vague context,
            inflate weak claims, smooth over missing evidence, and make everything sound more
            complete than it is. That&apos;s bad writing, but it&apos;s also a model-evaluation
            problem: the system needs a way to distinguish supported claims from
            plausible-sounding unsupported ones.
          </p>
          <p>
            The constraint is simple. Strong claims need provenance. If the source material
            doesn&apos;t support a metric, credential, ownership claim, or technical depth claim,
            the pipeline should surface that gap instead of quietly fabricating the missing
            bridge.
          </p>
        </WriteupSection>

        <WriteupSection title="Approach">
          <p>
            A deterministic shell with bounded agentic interiors. The outer workflow is explicit
            LangGraph state management. LLM calls, when enabled, live inside named nodes with
            structured inputs and Pydantic output models &mdash; not inside a free-roaming agent.
          </p>
          <ol className="flex flex-col gap-2 list-decimal list-outside pl-5 marker:text-[var(--muted)] marker:font-mono">
            <li>Ingest candidate sources and target job descriptions.</li>
            <li>Normalize messy source material into <code className="text-xs font-mono text-[var(--accent-2)]">EvidenceItem</code> records with source excerpts.</li>
            <li>Parse the target role into concrete requirements.</li>
            <li>Build a coverage map marking each requirement <code className="text-xs font-mono text-[var(--accent-2)]">strong</code>, <code className="text-xs font-mono text-[var(--accent-2)]">weak</code>, <code className="text-xs font-mono text-[var(--accent-2)]">adjacent</code>, or <code className="text-xs font-mono text-[var(--accent-2)]">missing</code>.</li>
            <li>Generate bullet candidates only from matched evidence.</li>
            <li>Run adversarial review for unsupported claims, inflated metrics, vague language, duplicate bullets, and brittle interview claims.</li>
            <li>Arbitrate findings into accept, revise, flag-for-user, or removal decisions.</li>
            <li>Export markdown, plain text, and structured JSON artifacts with provenance metadata.</li>
          </ol>
        </WriteupSection>

        <WriteupSection title="Why this transfers to AI eval work">
          <p>
            A good evaluation system doesn&apos;t only ask whether the output sounds useful. It
            asks whether the output is grounded, inspectable, and rejectable. Several habits in
            this project transfer directly:
          </p>
          <ul className="flex flex-col gap-2 list-disc list-outside pl-5 marker:text-[var(--muted)]">
            <li><span className="text-[var(--accent-2)]">Rubrics:</span> job requirements become explicit criteria, not vague role-fit.</li>
            <li><span className="text-[var(--accent-2)]">Provenance:</span> bullet candidates carry <code className="text-xs font-mono">evidence_ids</code>; evidence items carry source excerpts.</li>
            <li><span className="text-[var(--accent-2)]">Unsupported-claim detection:</span> review nodes flag claims with no linked evidence.</li>
            <li><span className="text-[var(--accent-2)]">Structured outputs:</span> Pydantic models define evidence, coverage, bullets, findings, decisions, and run artifacts.</li>
            <li><span className="text-[var(--accent-2)]">Adversarial review:</span> reviewers can reject or block content, not just polish phrasing.</li>
            <li><span className="text-[var(--accent-2)]">Missing-evidence handling:</span> tests verify that missing requirements stay missing rather than being silently fabricated.</li>
          </ul>
        </WriteupSection>

        <WriteupSection title="Schema chain">
          <pre className="text-xs font-mono text-[var(--foreground)]/85 leading-relaxed overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--panel-2)] p-4">{`SourceDocument
  → EvidenceItem
    → CoverageMap
      → BulletCandidate
        → ReviewFinding
          → ArbitrationDecision
            → RunArtifact`}</pre>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Every layer carries the layer above it forward. A bullet without supporting evidence
            ids is a schema violation, not a stylistic problem.
          </p>
        </WriteupSection>

        <WriteupSection title="Proof points">
          <ProofGrid
            items={[
              { label: "orchestration", value: "LangGraph (explicit)" },
              { label: "schemas", value: "Pydantic v2" },
              { label: "model backends", value: "Anthropic + OpenAI" },
              { label: "fallback", value: "deterministic local mode" },
              { label: "pipeline tests", value: "2 / 2 passing" },
              { label: "verified", value: "2026-05-06" },
            ]}
          />
        </WriteupSection>

        <WriteupSection title="Stack">
          <StackList
            items={[
              "Python 3.11+",
              "LangGraph",
              "Pydantic v2",
              "Anthropic SDK",
              "OpenAI SDK",
              "pytest",
              "Markdown / JSON exports",
            ]}
          />
        </WriteupSection>

        <WriteupSection title="Boundaries">
          <p className="text-sm text-[var(--muted)]">
            This is a working evaluation-oriented prototype, not a production hiring platform or
            mass-application tool. It doesn&apos;t replace human judgment. The accurate claim is
            that I designed the workflow, specified the evidence and review constraints, drove
            the AI-assisted implementation, and verified the behavior through tests and sample
            runs.
          </p>
        </WriteupSection>
      </Writeup>
    </>
  );
}
