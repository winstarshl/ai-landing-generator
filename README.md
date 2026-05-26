# LandingForge — AI Landing Page Generator

Describe a product or offer in a sentence, review an AI-drafted landing-page **plan** (structure, copy, and visual direction), tweak or regenerate any part, then publish a polished, mobile-first landing page at a shareable link.

**Live demo:** https://ai-landing-generator-pink.vercel.app

> Built as a side project for an AI Engineer role. The goal was a small but real B2C product with a multi-step AI pipeline, a clean approval step, and a polished mobile output — not a single model call.

<p align="center">
  <img src="docs/preview.png" alt="A generated, published landing page rendered on a phone" width="320" />
</p>

---

## What it does

1. **Prompt** — the user describes a product/offer.
2. **Draft plan** — the app generates a structured plan: detected product, a cohesive theme (palette/font/mood), and 4–7 sections (hero, benefits, features, social proof, pricing, FAQ, CTA) with concrete copy and a visual direction each.
3. **Review & approve** — the plan is shown as human-readable cards (not JSON). The user edits any field inline, regenerates individual sections with optional instructions, then approves.
4. **Final landing page** — the approved plan is rendered into a themed, mobile-first page available at a shareable URL.

## Architecture

It's an **orchestrated workflow, not an autonomous agent** — a deterministic server pipeline with structured LLM calls and a human approval gate. (The task explicitly asked not to overengineer; an agent loop would add unpredictability and make the approval step awkward.)

```
prompt
 └─ POST /api/generate-plan   (streams NDJSON stages: planning → refining → done)
      1. PLAN      Claude Sonnet + tool use → strict JSON (validated by Zod)
      2. CRITIQUE  fast Haiku pass reviews & improves the draft plan
 ── user reviews / edits / regenerates, with a live mobile preview ──  (approval gate)
 └─ POST /api/regenerate-section   rewrites one section, preserving the rest
 └─ POST /api/finalize
      3. FINALIZE  polishes copy + attaches deterministic mock visuals
      → saves the page to Vercel Blob under a short id → returns { id }
 GET /p/[id]   server-renders the final page loaded from the store (short link)
```

Key decisions:

- **Structured outputs, never raw markup.** The model returns a typed JSON plan via Claude **tool use**; a single **Zod** schema is the source of truth (runtime validation + TS types + the tool's `input_schema`). Invalid output triggers one automatic retry with the error fed back.
- **JSON → component registry.** The final page maps each `section.type` to a polished, mobile-first React component. The model produces *content*; the app owns *layout and quality*. The AI-derived theme is applied via CSS variables.
- **Self-critique** (`generate → critique → improve`) is a lightweight agentic touch that demonstrably lifts copy quality, kept fast by running the review on Haiku.
- **Short share links via Vercel Blob.** A finalized page is stored by a short id (`/p/aB3xK9…`). The route still accepts a self-contained gzip+base64url token, so the original stateless links — and the offline E2E test — keep working unchanged.
- **Streaming progress.** `generate-plan` streams real pipeline stages (NDJSON) so the loader reflects what's actually happening, not a fake spinner.
- **Product polish & safeguards.** Per-section visual direction + live preview before approval; the theme's web font is loaded and body-text contrast is auto-fixed to WCAG AA; each published page ships a dynamic Open Graph share-card; public LLM endpoints are rate-limited per IP.

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · `@anthropic-ai/sdk` (Claude Sonnet + Haiku, tool use) · Zod · Vitest + React Testing Library · Playwright · deployed on Vercel.

## Local development

```bash
npm install
cp .env.example .env.local        # then set ANTHROPIC_API_KEY=...
npm run dev                        # http://localhost:3000
```

Environment variables (see `.env.example`):

| Var | Required | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Claude API key. |
| `ANTHROPIC_MODEL` | no | Plan/finalize model. Default `claude-sonnet-4-6`. Set to a Haiku id for ~2× faster, slightly simpler copy. |
| `ANTHROPIC_FAST_MODEL` | no | Critique model. Default `claude-haiku-4-5-20251001`. |

## Testing & CI/CD

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # eslint
npm test              # Vitest: schema, theme, pipeline, Claude wrapper, API routes, component registry
npm run test:e2e      # Playwright: full prompt→review→edit→approve→publish flow (mobile viewport)
```

- **Unit/component/API tests mock the Anthropic SDK**, and **E2E intercepts `/api/*` at the browser level** — so the whole suite is deterministic, free, and needs no API key.
- **CI** (GitHub Actions, `.github/workflows/ci.yml`): typecheck → lint → unit/component → production build → Playwright E2E on every push/PR.
- **CD** (Vercel): production is deployed on Vercel with `ANTHROPIC_API_KEY` stored in the project's environment (never in the repo). Connecting the GitHub repo to Vercel enables push-to-`main` production deploys and per-PR preview deployments.

## How AI tools were used during development

100% of the code was written with **Claude Code**: brainstorming the design, an explicit spec (`docs/superpowers/specs/`) and implementation plan (`docs/superpowers/plans/`), then test-driven implementation task-by-task (failing test → minimal code → commit). Claude also verified real model latency against the live API and chose model ids by querying the Anthropic models endpoint.

## Intentionally simplified for the time budget

- No auth/accounts — anyone can generate and share.
- **Mock visuals** (themed gradients + Lucide icons derived from each section's visual direction) instead of real image generation.
- Plan editing is structured field edits + per-section regenerate, not a full WYSIWYG editor.
- Published pages are stored in Vercel Blob (simple key→JSON); no relational schema or CMS.
- Rate limiting is in-memory per serverless instance — a pragmatic abuse guard; a KV-backed limiter would make it global.

## Project structure

```
src/lib/         schema (Zod) · theme · visuals · prompts · anthropic wrapper · pipeline · page codec
src/components/  section components + registry, UI primitives, and the client app (Generator)
src/app/         input screen (/), API routes, and the published page (/p/[token])
tests/e2e/       Playwright flow tests
docs/superpowers/  the design spec and implementation plan this was built from
```
