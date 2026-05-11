import { DemoContainer } from "@/components/spiderzz/DemoContainer";
import {
  ProofGrid,
  StackList,
  Writeup,
  WriteupHeader,
  WriteupSection,
  WriteupTwoCol,
} from "@/components/Writeup";

export const metadata = {
  title: "SpiderZZ — Human-in-the-loop QA Orchestrator | John James",
  description:
    "Browser automation that prepares a multi-platform telecom inspection QA queue, then handles the turn-in work after the human reviewer makes the call.",
};

export default function SpiderZZDemo() {
  return (
    <>
      <main className="px-5 md:px-10 py-10 max-w-6xl mx-auto w-full">
        <DemoContainer />
      </main>

      <Writeup>
        <WriteupHeader
          eyebrow="case study"
          title="Human-in-the-loop QA orchestrator"
          lede="Operational scaffolding for telecom inspection QA. SpiderZZ removes setup, tab switching,
          copy/paste, and form-fill work so the reviewer spends attention on quality judgment instead
          of process memory."
        />

        <WriteupSection title="The problem">
          <p>
            The original QA workflow required a reviewer to manually juggle three separate web
            platforms: a CRM listing sites in &ldquo;Ready for QA,&rdquo; an inspection media portal
            with each site session and uploaded folders, and a 3D model platform with optional
            model links for some sites.
          </p>
          <p>
            For each site, the reviewer had to sort the queue oldest-first, copy the site name,
            switch to the inspection portal, change the search scope from the default personal view
            to all sites, search for the site, enter the session if it existed, check whether
            relevant 360 views or 3D models had already been added, add missing ones from
            uploaded folders, review the prepared session, and then return to the workflow system
            to create a review record with the session URL, reviewer name, result, and fail reason.
          </p>
          <p>
            That created too many chances for non-review failures: forgetting the search scope,
            using the wrong tab, losing the session URL, skipping a relevant folder, re-opening a
            site already reviewed, or burning mental energy on setup rather than QA.
          </p>
        </WriteupSection>

        <WriteupSection title="The solution">
          <p>
            SpiderZZ turns the workflow into a prepared queue. The reviewer asks the system to load
            a batch; the orchestrator fetches the ready-for-QA queue, preserves report order, and
            prepares each selected site. The dashboard shows prepared site links, optional 3D model
            links, current state, result input, fail reason field, and turn-in status.
          </p>
          <p>
            The reviewer opens each prepared site, performs the QA review, leaves passing sites at
            the default value, and marks fails with a required reason. When review is done, the
            reviewer chooses &ldquo;Turn In Selected&rdquo; and the automation completes the
            workflow-system review records.
          </p>
          <p className="text-[var(--muted)]">
            The human stays in the loop until turn-in. Automation resumes only after the reviewer
            has reviewed the sites and explicitly starts the turn-in step.
          </p>
        </WriteupSection>

        <WriteupSection title="What the orchestrator does">
          <ul className="flex flex-col gap-2 list-disc list-outside pl-5 marker:text-[var(--muted)]">
            <li>Fetches the ready-for-QA queue and keeps source order stable.</li>
            <li>Uses isolated Playwright browser contexts per platform so sessions stay separate.</li>
            <li>Searches the inspection portal in the correct all-sites scope, not the default personal scope.</li>
            <li>Enters the site session when available and checks existing media before adding anything new.</li>
            <li>Matches folder names against known inspection flight types and adds relevant 360 views.</li>
            <li>Searches for a 3D model and links it when present; skips gracefully when none exists.</li>
            <li>Saves prepared site URLs and state in the dashboard, preserving the visited-link color so the reviewer can see at a glance which sites they&apos;ve already opened.</li>
            <li>After review, turns in selected sites with the saved URL, reviewer identity, result, and fail reason.</li>
          </ul>
        </WriteupSection>

        <WriteupTwoCol
          left={{
            title: "What automation handles",
            items: [
              "Queue loading",
              "Session lookup",
              "Relevant 360 view setup",
              "Optional 3D model linking",
              "URL preservation",
              "Dashboard state",
              "Review-record form fill after approval",
            ],
          }}
          right={{
            title: "What the reviewer owns",
            items: [
              "Whether the site was actually reviewed",
              "Pass/fail judgment",
              "Fail reason wording",
              "The decision to turn in selected rows",
            ],
          }}
        />

        <WriteupSection title="Outcome">
          <p>
            Operator-observed throughput improved from roughly 25 minutes per site manually to
            under 4 minutes per site with the orchestrator for prepared/reviewed sites.
          </p>
          <p>
            The largest reported batch was 100 sites. The fully manual version would have taken
            several days; with the orchestrator, the batch took a few hours.
          </p>
          <p className="text-[var(--muted)]">
            The bigger win wasn&apos;t only elapsed time. Manual review fatigue compounds as
            volume rises, because each site requires many small process-memory steps before and
            after the actual review. SpiderZZ makes the workflow scale more linearly by removing
            most of that setup and turn-in cognitive load.
          </p>
        </WriteupSection>

        <WriteupSection title="Proof points">
          <ProofGrid
            items={[
              { label: "throughput / site", value: "~25 min → <4 min" },
              { label: "largest batch", value: "100 sites" },
              { label: "batch time", value: "days → hours" },
              { label: "unit tests green", value: "1163 / 1163" },
              { label: "verified", value: "2026-05-06" },
              { label: "browser contexts", value: "3 isolated" },
            ]}
          />
        </WriteupSection>

        <WriteupSection title="Stack">
          <StackList
            items={[
              "Python 3.11",
              "Playwright (isolated contexts per platform)",
              "FastAPI",
              "HTMX dashboard",
              "Pydantic",
              "Behavior-map specs as refactor guardrails",
            ]}
          />
        </WriteupSection>

        <WriteupSection title="Boundaries">
          <p className="text-sm text-[var(--muted)]">
            This is defensive workflow automation for QA operations. Vendor names, customer
            records, real site IDs, pilot names, and screenshots from private systems are omitted
            from the portfolio version. SpiderZZ is not bot evasion, CAPTCHA bypassing, legal
            attestation automation, or unsupervised regulated approval. The source repo is private.
          </p>
        </WriteupSection>
      </Writeup>
    </>
  );
}
