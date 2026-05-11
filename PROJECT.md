# John Portfolio Site

## Objective
Maintain a public-facing Next.js portfolio site for John E James V's demos, case studies, and applied AI / operations automation work.

## Success Criteria
- The site builds from source outside of the `C:\job-search` career knowledge base.
- Public pages present polished, employer/client-safe versions of the portfolio material.
- Private career evidence remains in `C:\job-search\materials\portfolio` unless intentionally copied into this repo.
- A fresh agent can resume work from `STATUS.md` without inspecting the old `.claude` worktree.

## Scope
- Next.js app code, UI components, public assets, demo pages, and deployment-facing docs.
- Public-safe portfolio/case-study copy and demo fixtures needed by the site.
- Build, lint, and local development workflow for the portfolio site.

## Out of Scope
- Private career notes, raw application materials, archived job-search state, or browser/auth state.
- Generated build outputs such as `.next`, logs, coverage, or local runtime files.
- Rewriting the career knowledge base; that remains in `C:\job-search`.

## Constraints
- Keep the site deployable from this independent repo.
- Treat `C:\job-search\materials\portfolio` as source/reference material, not a nested app home.
- Do not publish private or candid internal notes without explicit review.

## Key Assumptions
- This repo was copied from `C:\job-search\.claude\worktrees\upbeat-moser-e60edb\materials\portfolio-site` on 2026-05-10.
- The copied app is expected to install with `npm install` and run with `npm run dev`.
