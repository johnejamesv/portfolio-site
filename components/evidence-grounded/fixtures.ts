import type {
  Bullet,
  Decision,
  Evidence,
  Finding,
  Requirement,
  SourceDoc,
} from "./types";

export const sources: SourceDoc[] = [
  {
    id: "src-resume",
    filename: "candidate-resume.md",
    excerpt:
      "Designed task-specific rubrics and reviewer finding structures for an internal LLM eval workflow. Built FastAPI service backed by Pydantic schemas for prompts, rubric items, model responses, and reviewer findings.",
  },
  {
    id: "src-notes",
    filename: "project-notes.md",
    excerpt:
      "Reduced review queue from a three-day backlog to same-day triage after adding reviewer routing and structured failure reasons. Used weekly failure-rate summaries; no formal confidence intervals or inter-rater reliability analysis.",
  },
  {
    id: "src-job",
    filename: "target-job.md",
    excerpt:
      "AI Evaluation Systems Engineer. Looking for: rubric design, structured outputs (Pydantic), LLM observability tooling, statistical eval methods, RAG architectures with vector databases.",
  },
];

export const evidenceItems: Evidence[] = [
  {
    id: "ev-rubric",
    text: "Designed task-specific rubrics and reviewer finding structures.",
    category: "rubric_design",
    sourceId: "src-resume",
  },
  {
    id: "ev-schema",
    text: "Designed Pydantic schemas for prompts, rubric items, model responses, reviewer findings.",
    category: "structured_output",
    sourceId: "src-resume",
  },
  {
    id: "ev-routing",
    text: "Reduced review queue from three-day backlog to same-day triage with reviewer routing + structured failure reasons.",
    category: "human_review",
    sourceId: "src-notes",
  },
  {
    id: "ev-weekly",
    text: "Used weekly failure-rate summaries; no formal CI or inter-rater analysis.",
    category: "statistical_eval",
    sourceId: "src-notes",
  },
];

export const requirements: Requirement[] = [
  {
    id: "req-rubric",
    text: "Experience designing rubrics for LLM evaluation or expert review workflows",
    strength: "strong",
    evidenceIds: ["ev-rubric"],
    reason: "Candidate designed task-specific rubrics and reviewer finding structures.",
  },
  {
    id: "req-structured-output",
    text: "Strong Python with Pydantic structured outputs",
    strength: "strong",
    evidenceIds: ["ev-schema"],
    reason: "Resume cites Python, FastAPI, Pydantic schemas, structured records.",
  },
  {
    id: "req-observability",
    text: "Familiarity with LLM observability tools such as LangSmith or Langfuse",
    strength: "adjacent",
    evidenceIds: [],
    reason:
      "Candidate has prompt regression fixtures + review artifacts, but no cited LangSmith/Langfuse deployment.",
  },
  {
    id: "req-statistical-eval",
    text: "Comfort with statistical evaluation methods, inter-rater agreement, benchmark design",
    strength: "weak",
    evidenceIds: ["ev-weekly"],
    reason: "Weekly failure-rate summaries only; source notes explicitly say no formal CI/IRR.",
  },
  {
    id: "req-rag",
    text: "Experience with RAG architectures, vector databases, embedding models, chunking",
    strength: "missing",
    evidenceIds: [],
    reason: "Demo source notes do not support production retrieval, vector DB, or embedding claims.",
  },
];

export const bullets: Bullet[] = [
  {
    id: "b-routing",
    text: "Reduced support escalation review time by 73% with structured reviewer routing and failure reasons.",
    evidenceIds: ["ev-routing"],
    variant: "metric_forward",
    targetRequirementId: "req-rubric",
  },
  {
    id: "b-schema",
    text: "Designed Pydantic schemas for prompts, rubric items, model responses, reviewer findings, and run artifacts.",
    evidenceIds: ["ev-schema"],
    variant: "technical_depth",
    targetRequirementId: "req-structured-output",
  },
  {
    id: "b-rubric",
    text: "Designed task-specific rubrics and reviewer finding structures for an internal LLM eval workflow.",
    evidenceIds: ["ev-rubric"],
    variant: "balanced",
    targetRequirementId: "req-rubric",
  },
];

export const findings: Finding[] = [
  {
    id: "f-routing-metric",
    bulletId: "b-routing",
    severity: "hard_fail",
    issue: "inflated_metric",
    description:
      'Bullet includes unsupported numeric claim: "73%". Source evidence supports "same-day triage" but not a quantified percentage.',
    suggestedAction: "Use only metrics that appear in the source evidence.",
  },
];

export const decisions: Decision[] = [
  {
    findingId: "f-routing-metric",
    action: "flag_for_user",
    rationale: "Removed from the exported draft until the 73% number can be confirmed in source.",
  },
];
