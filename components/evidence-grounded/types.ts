export type Strength = "strong" | "weak" | "adjacent" | "missing";
export type Severity = "hard_fail" | "soft_suggestion";
export type ArbiterAction = "accept" | "revise" | "flag_for_user" | "remove";

export type SourceDoc = {
  id: string;
  filename: string;
  excerpt: string;
};

export type Evidence = {
  id: string;
  text: string;
  category: string;
  sourceId: string;
};

export type Requirement = {
  id: string;
  text: string;
  strength: Strength;
  evidenceIds: string[];
  reason: string;
};

export type Bullet = {
  id: string;
  text: string;
  evidenceIds: string[];
  variant: string;
  targetRequirementId: string;
};

export type Finding = {
  id: string;
  bulletId: string;
  severity: Severity;
  issue: "inflated_metric" | "vague_language" | "missing_provenance" | "duplicate";
  description: string;
  suggestedAction: string;
};

export type Decision = {
  findingId: string;
  action: ArbiterAction;
  rationale: string;
};

export type Stage =
  | "input"
  | "evidence"
  | "coverage"
  | "bullets"
  | "redteam"
  | "export";
