export type Panel = "crm" | "portal" | "model3d";

export type SiteRow = {
  id: string;
  tower: string;
  status: "queued" | "reviewing" | "done";
};

export type BeforeState = {
  activePanel: Panel;
  clipboard: string;
  crm: {
    queue: SiteRow[];
    cursorRow: string | null;
    formOpen: boolean;
    form: { url: string; reviewer: string; result: "" | "Pass" | "Fail"; failReason: string };
  };
  portal: {
    scope: "my" | "all";
    search: string;
    sessionId: string | null;
    sessionOpen: boolean;
    media360: { topOfTower: boolean; antennaFace: boolean; coax: boolean };
    modelLinked: boolean;
  };
  model3d: {
    search: string;
    foundModelFor: string | null;
    linkCopied: boolean;
  };
  // metrics
  clicks: number;
  tabSwitches: number;
  copies: number;
  pastes: number;
};

export type StepKind = "click" | "tab" | "copy" | "paste" | "wait";

export type Step = {
  id: string;
  panel: Panel;
  caption: string;
  targetId: string; // id used to highlight an element via data-target
  kind: StepKind;
  apply: (s: BeforeState) => BeforeState;
};

export type AfterRow = {
  id: string;
  tower: string;
  preparedUrl: string;
  modelUrl: string | null;
  opened: boolean;
  result: "" | "Pass" | "Fail";
  failReason: string;
  selected: boolean;
  status: "ready" | "turned-in";
};
