# AGENTS.md

## Status
Scaffolded Next.js app (App Router, TypeScript, Tailwind v4). Lint/typecheck/build work; there are no tests yet.

## Project
"berbagi-file": file-sharing/download site for teachers and the local school community. Supported file types: `.pdf`, `.docx`, `.xlsx`, `.odt`, `.ppt`, `.psd`, `.svg`.

## Stack (from `plan.md`)
- Next.js 16 (App Router) + React 19
- Neon (`@neondatabase/serverless`, raw SQL in `db/schema.sql`)
- Clerk (`@clerk/nextjs`, `proxy.ts` in Next 16 replaces `middleware.ts`)
- Resend (upload notifications)
- Cloudflare R2 via S3 SDK (presigned upload/download)
- Deploy target: Cloudflare (Pages/Workers via `@opennextjs/cloudflare`)

## Commands
- `npm run dev` — dev server (webpack; Turbopack native bindings are unavailable on Android/Termux)
- `npm run build` — production build (Turbopack)
- `npm run build:webpack` — production build with webpack (use on Termux/arm64)
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- No test runner is configured yet.

## Environment
Copy `.env.example` to `.env.local` and fill in Clerk, `DATABASE_URL`, R2, and Resend values. Never commit real secrets.

Apply the database schema with `psql "$DATABASE_URL" -f db/schema.sql`.

## Conventions
- Read `plan.md` before implementing; it is the only source of project intent.
- Keep secrets in env vars (Clerk, Neon, Resend, R2 credentials); never commit them.
- Cloudflare deployment means avoid Node-only runtime assumptions; prefer edge/runtime-compatible APIs.
- `/opencode-skills/` is a local tooling clone, not part of the app; it is git- and lint-ignored.
- On Termux, shebangs pointing at `/usr/bin/env` fail. Run `termux-fix-shebang` when needed, or invoke binaries with `node node_modules/<pkg>/...`.
