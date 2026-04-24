# Deferred Work

## Deferred from: code review of 1-1-project-scaffold-and-monorepo-setup (2026-04-25)

- No `.env` loading mechanism — no dotenv or equivalent; `process.env` only works with external env setup
- PORT env var not validated — non-numeric or out-of-range PORT causes undefined behavior in server.ts
- `app.close()` not in `afterEach`/`finally` in server test — assertion failure could leak Fastify handles
- Spacing rhythm tokens not defined — AC #3 mentions "spacing rhythm" but Tailwind v4 built-in spacing suffices; add custom tokens when design requires them
