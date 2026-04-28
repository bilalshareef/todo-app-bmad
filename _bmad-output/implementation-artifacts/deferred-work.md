# Deferred Work

## Deferred from: code review of 1-1-project-scaffold-and-monorepo-setup (2026-04-25)

- No `.env` loading mechanism — no dotenv or equivalent; `process.env` only works with external env setup
- PORT env var not validated — non-numeric or out-of-range PORT causes undefined behavior in server.ts
- `app.close()` not in `afterEach`/`finally` in server test — assertion failure could leak Fastify handles
- Spacing rhythm tokens not defined — AC #3 mentions "spacing rhythm" but Tailwind v4 built-in spacing suffices; add custom tokens when design requires them

## Deferred from: code review of 1-4-display-todos-full-stack (2026-04-26)

- Error path renders the success empty state — deferred, will be covered as part of a later ticket.

## Deferred from: code review of 1-6-containerization-dockerfiles (2026-04-28)

- Hardcoded DB credentials in docker-compose.yml — standard for local dev, security improvement for production config later
- Fragile sed-based import rewriting in server Dockerfile — Prisma ESM workaround, revisit when Prisma supports ESM natively
- nginx.conf missing security headers (X-Frame-Options, CSP, etc.) — production hardening task
- 404 schema uses `type: 'number'` instead of `'integer'` for statusCode — pre-existing, not introduced by this story
- Health endpoint doesn't verify database connectivity — application-level change, not containerization scope
