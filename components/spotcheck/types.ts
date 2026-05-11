export type QaStatus = "PASSED" | "FAILED" | "NEEDS_REVIEW";

export type SamplePhoto = {
  fileName: string;
  createDate: string;
  lat: number;
  lon: number;
  altitude: number;
  gimbalPitch: number;
  gimbalYaw: number;
  imageWidth: number;
};

export type Segment = {
  id: string;
  category: string;
  rawCategory: string;
  photoCount: number;
  orbitType: string;
  totalRotation: number | null;
  medianPitch: number;
  medianAltitude: number;
  imageWidth: number;
  rule: string;
  qaStatus: QaStatus;
  samplePhotos: SamplePhoto[];
  /** Set on correction-sample segments. */
  version?: number;
  /** Set on the synthesized v2 replacement segment. */
  note?: string;
};

export type Sample = {
  id: string;
  name: string;
  description: string;
  photoCount: number;
  timeRange: { start?: string; end?: string };
  altitudeRange: { min?: number; max?: number };
  pitchRange: { min?: number; max?: number };
  requiredCategories: string[];
  segments: Segment[];
  /** Only on correction samples. */
  replacedSegmentId?: string | null;
};

export type Stage = "ingest" | "extracting" | "classify" | "results" | "diff";

export type SubmissionSource = "upload" | "correction" | "qc_review";

export type Submission = {
  sequenceNumber: number;
  message: string;
  source: SubmissionSource;
  submittedAt: string;
  segments: Segment[];
};

export type DiffStatus = "unchanged" | "replaced" | "added" | "removed";

export type SegmentDiff = {
  category: string;
  status: DiffStatus;
  before: Segment | null;
  after: Segment | null;
};
