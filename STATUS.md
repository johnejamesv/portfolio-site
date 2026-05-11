# Status

## Current State
As of 2026-05-10, the portfolio site has been moved out of the `C:\job-search\.claude` worktree into its own project folder at `C:\john-portfolio-site`.

The source app was copied without `node_modules`, `.next`, or Playwright/output artifacts. Runtime logs and TypeScript build info copied from the scratch worktree were removed.

## Resume Point
Start here:

1. Use `C:\job-search\materials\portfolio` only as private/reference source material.
2. Continue site work in `C:\john-portfolio-site`.
3. Update this file after meaningful site changes.

## Do Not Redo
- Do not keep developing the portfolio app inside `C:\job-search\.claude\worktrees\...`.
- Do not move private KB files into this repo unless they are intentionally edited into public-facing material.
- Do not commit generated folders such as `.next`, `node_modules`, or local output captures.

## Decisions Needed
- Confirm preferred deployment target and public URL.
- Decide which case studies should be first-class public pages.

## Recent Changes
- Created independent project folder at `C:\john-portfolio-site`.
- Added project handoff docs.
- Kept generated dependency/build folders out of the copy.
- Ran `npm install`.
- Fixed copied-app React/ESLint issues in the SpiderZZ and SpotCheck demo components.
- Verified `npm run lint` passes.
- Verified `npm run build` passes.
