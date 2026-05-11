import type { BeforeState, Step } from "./types";

export const SITE_ID = "FA-78215";
export const SITE_TOWER = "Mt. Lemmon West";
export const SESSION_URL = "portal://sessions/FA-78215";
export const MODEL_URL = "model3d://share/FA-78215-7c3a";
export const REVIEWER_NAME = "Casey Morgan";

export const sitesSeed = [
  { id: "FA-78215", tower: "Mt. Lemmon West, AZ" },
  { id: "FA-78216", tower: "Reno North 4, NV" },
  { id: "FA-78219", tower: "Norfolk Pier 12, VA" },
  { id: "FA-78224", tower: "Sandia Ridge, NM" },
  { id: "FA-78231", tower: "Outer Banks 2, NC" },
];

export const initialBefore: BeforeState = {
  activePanel: "crm",
  clipboard: "",
  crm: {
    queue: sitesSeed.map((s) => ({ ...s, status: "queued" as const })),
    cursorRow: null,
    formOpen: false,
    form: { url: "", reviewer: "", result: "", failReason: "" },
  },
  portal: {
    scope: "my",
    search: "",
    sessionId: null,
    sessionOpen: false,
    media360: { topOfTower: false, antennaFace: true, coax: true },
    modelLinked: false,
  },
  model3d: {
    search: "",
    foundModelFor: null,
    linkCopied: false,
  },
  clicks: 0,
  tabSwitches: 0,
  copies: 0,
  pastes: 0,
};

const switchPanel = (s: BeforeState, p: BeforeState["activePanel"]): BeforeState => ({
  ...s,
  activePanel: p,
  tabSwitches: s.activePanel === p ? s.tabSwitches : s.tabSwitches + 1,
});

export const beforeSteps: Step[] = [
  {
    id: "crm-select",
    panel: "crm",
    caption: "Sort the QA queue oldest-first and click into the top site.",
    targetId: "crm-row-FA-78215",
    kind: "click",
    apply: (s) => ({
      ...s,
      crm: { ...s.crm, cursorRow: SITE_ID, queue: s.crm.queue.map(r => r.id === SITE_ID ? { ...r, status: "reviewing" } : r) },
      clicks: s.clicks + 1,
    }),
  },
  {
    id: "crm-copy-id",
    panel: "crm",
    caption: "Copy the site ID — you'll need it to search the inspection portal.",
    targetId: "crm-copy-FA-78215",
    kind: "copy",
    apply: (s) => ({ ...s, clipboard: SITE_ID, copies: s.copies + 1, clicks: s.clicks + 1 }),
  },
  {
    id: "switch-portal-1",
    panel: "portal",
    caption: "Switch to the inspection portal tab.",
    targetId: "tab-portal",
    kind: "tab",
    apply: (s) => switchPanel(s, "portal"),
  },
  {
    id: "portal-scope",
    panel: "portal",
    caption: 'The portal defaults to "My Sites" — change scope to "All Sites" or the search will miss it.',
    targetId: "portal-scope",
    kind: "click",
    apply: (s) => ({ ...s, portal: { ...s.portal, scope: "all" }, clicks: s.clicks + 1 }),
  },
  {
    id: "portal-paste",
    panel: "portal",
    caption: "Paste the site ID into search.",
    targetId: "portal-search-input",
    kind: "paste",
    apply: (s) => ({ ...s, portal: { ...s.portal, search: s.clipboard }, pastes: s.pastes + 1, clicks: s.clicks + 1 }),
  },
  {
    id: "portal-search-go",
    panel: "portal",
    caption: "Run the search.",
    targetId: "portal-search-go",
    kind: "click",
    apply: (s) => ({ ...s, portal: { ...s.portal, sessionId: SITE_ID }, clicks: s.clicks + 1 }),
  },
  {
    id: "portal-open-session",
    panel: "portal",
    caption: "Open the session for this site.",
    targetId: "portal-session-row",
    kind: "click",
    apply: (s) => ({ ...s, portal: { ...s.portal, sessionOpen: true }, clicks: s.clicks + 1 }),
  },
  {
    id: "portal-add-360",
    panel: "portal",
    caption: '"Top of Tower" 360 is missing — add it from the matching upload folder.',
    targetId: "portal-add-tot",
    kind: "click",
    apply: (s) => ({ ...s, portal: { ...s.portal, media360: { ...s.portal.media360, topOfTower: true } }, clicks: s.clicks + 1 }),
  },
  {
    id: "switch-model3d",
    panel: "model3d",
    caption: "Switch to the 3D model platform to check for an existing model.",
    targetId: "tab-model3d",
    kind: "tab",
    apply: (s) => switchPanel(s, "model3d"),
  },
  {
    id: "model3d-search",
    panel: "model3d",
    caption: "Paste site ID and search.",
    targetId: "model3d-search",
    kind: "paste",
    apply: (s) => ({ ...s, model3d: { ...s.model3d, search: SITE_ID, foundModelFor: SITE_ID }, pastes: s.pastes + 1, clicks: s.clicks + 1 }),
  },
  {
    id: "model3d-copy-link",
    panel: "model3d",
    caption: "Copy the share link.",
    targetId: "model3d-copy",
    kind: "copy",
    apply: (s) => ({ ...s, clipboard: MODEL_URL, model3d: { ...s.model3d, linkCopied: true }, copies: s.copies + 1, clicks: s.clicks + 1 }),
  },
  {
    id: "switch-portal-2",
    panel: "portal",
    caption: "Back to the portal session.",
    targetId: "tab-portal",
    kind: "tab",
    apply: (s) => switchPanel(s, "portal"),
  },
  {
    id: "portal-link-model",
    panel: "portal",
    caption: "Paste the model link into the session's 3D field.",
    targetId: "portal-add-3d",
    kind: "paste",
    apply: (s) => ({ ...s, portal: { ...s.portal, modelLinked: true }, pastes: s.pastes + 1, clicks: s.clicks + 1 }),
  },
  {
    id: "review-pause",
    panel: "portal",
    caption: "(Reviewer inspects the prepared session — this is the only step that's actually QA.)",
    targetId: "portal-session-body",
    kind: "wait",
    apply: (s) => s,
  },
  {
    id: "switch-crm",
    panel: "crm",
    caption: "Back to the workflow system to file the review record.",
    targetId: "tab-crm",
    kind: "tab",
    apply: (s) => switchPanel(s, "crm"),
  },
  {
    id: "crm-open-form",
    panel: "crm",
    caption: 'Click "Create review record" on the row.',
    targetId: "crm-create-FA-78215",
    kind: "click",
    apply: (s) => ({ ...s, crm: { ...s.crm, formOpen: true }, clicks: s.clicks + 1 }),
  },
  {
    id: "crm-paste-url",
    panel: "crm",
    caption: "Paste the prepared session URL.",
    targetId: "crm-form-url",
    kind: "paste",
    apply: (s) => ({ ...s, crm: { ...s.crm, form: { ...s.crm.form, url: SESSION_URL } }, pastes: s.pastes + 1, clicks: s.clicks + 1 }),
  },
  {
    id: "crm-reviewer",
    panel: "crm",
    caption: "Pick reviewer name from the dropdown.",
    targetId: "crm-form-reviewer",
    kind: "click",
    apply: (s) => ({ ...s, crm: { ...s.crm, form: { ...s.crm.form, reviewer: REVIEWER_NAME } }, clicks: s.clicks + 1 }),
  },
  {
    id: "crm-pass",
    panel: "crm",
    caption: "Mark Pass.",
    targetId: "crm-form-pass",
    kind: "click",
    apply: (s) => ({ ...s, crm: { ...s.crm, form: { ...s.crm.form, result: "Pass" } }, clicks: s.clicks + 1 }),
  },
  {
    id: "crm-save",
    panel: "crm",
    caption: "Save the record. One site done — four to go.",
    targetId: "crm-form-save",
    kind: "click",
    apply: (s) => ({
      ...s,
      crm: {
        ...s.crm,
        formOpen: false,
        form: { url: "", reviewer: "", result: "", failReason: "" },
        cursorRow: null,
        queue: s.crm.queue.map(r => r.id === SITE_ID ? { ...r, status: "done" } : r),
      },
      clicks: s.clicks + 1,
    }),
  },
];
