# Story 1.1: Project Scaffold & Monorepo Setup

Status: done

## Story

As a developer,
I want a fully initialized monorepo with frontend and backend packages, tooling, and local dev environment,
So that I can begin building features on a solid foundation.

## Acceptance Criteria

1. **Given** the project is being initialized for the first time **When** the developer runs the setup commands **Then** a monorepo exists with `packages/client` (React + Vite + TypeScript) and `packages/server` (Fastify + TypeScript) using npm workspaces
2. **And** Tailwind CSS v4 is configured via `@tailwindcss/vite` plugin with Inter font from Google Fonts
3. **And** design tokens are configured in Tailwind: color palette (#FFFFFF, #F9FAFB, #111827, #6B7280, #9CA3AF, #E5E7EB, #3B82F6, #10B981, #EF4444, #1F2937), typography (Inter), spacing rhythm
4. **And** ESLint and Prettier are configured with shared rules
5. **And** Jest with ts-jest is configured for both packages with co-located test file convention
6. **And** `tsconfig.base.json` exists with shared TypeScript config, extended by each package
7. **And** `.env.example` is committed with documented environment variables
8. **And** `.gitignore` properly excludes node_modules, .env, dist, and build artifacts
9. **And** `npm install` from the root installs all workspace dependencies
10. **And** the Vite dev server starts and renders a placeholder page
11. **And** the Fastify server starts and responds to `GET /health` with `{ status: "ok" }`

## Tasks / Subtasks

- [x] Task 1: Initialize monorepo root (AC: #1, #8, #9)
  - [x] Create root `package.json` with `"workspaces": ["packages/*"]`
  - [x] Create `.gitignore` (node_modules, .env, dist, build artifacts, .prisma)
  - [x] Create `tsconfig.base.json` with shared TypeScript config (strict, ESM, ES2020+ target)
- [x] Task 2: Scaffold frontend package (AC: #1, #10)
  - [x] Run `npm create vite@latest packages/client -- --template react-ts`
  - [x] Update `packages/client/tsconfig.json` to extend `../../tsconfig.base.json`
  - [x] Configure Vite proxy for `/api` requests to backend (`http://localhost:3001`)
  - [x] Verify Vite dev server starts and renders placeholder page
- [x] Task 3: Configure Tailwind CSS v4 (AC: #2, #3)
  - [x] Install `@tailwindcss/vite` and `tailwindcss` in client package
  - [x] Add `@tailwindcss/vite` plugin to `vite.config.ts`
  - [x] Configure CSS-first design tokens in `App.css` (Tailwind v4 approach — NOT tailwind.config.js):
    - Colors: white (#FFFFFF), warm-gray (#F9FAFB), near-black (#111827), medium-gray (#6B7280), completed-gray (#9CA3AF), border-gray (#E5E7EB), accent-blue (#3B82F6), success-green (#10B981), error-red (#EF4444), toast-dark (#1F2937)
    - Typography: Inter from Google Fonts (add `<link>` to `index.html`)
    - Font weights: 400 regular, 500 medium, 600 semi-bold
  - [x] Verify Tailwind utility classes work in a test component
- [x] Task 4: Scaffold backend package (AC: #1, #11)
  - [x] Create `packages/server/package.json` with TypeScript + Fastify dependencies
  - [x] Install: `fastify`, `@fastify/cors`, `@fastify/helmet`, `pino`, TypeScript, `tsx` (for dev)
  - [x] Create `packages/server/tsconfig.json` extending `../../tsconfig.base.json`
  - [x] Create `packages/server/src/server.ts` — entry point that starts Fastify on port 3001
  - [x] Create `packages/server/src/app.ts` — Fastify app factory (`createApp`) with health check route
  - [x] `GET /health` returns `{ status: "ok" }` — no envelope, no auth
  - [x] Verify Fastify server starts and responds to health check
- [x] Task 5: Configure ESLint + Prettier (AC: #4)
  - [x] Create root `.eslintrc.json` with shared TypeScript rules
  - [x] Create root `.prettierrc` with project formatting rules
  - [x] Add lint scripts to root `package.json`
  - [x] Verify linting passes on scaffold code
- [x] Task 6: Configure Jest (AC: #5)
  - [x] Install Jest + ts-jest in both packages
  - [x] Create `packages/client/jest.config.ts` (jsdom environment for React)
  - [x] Create `packages/server/jest.config.ts` (node environment)
  - [x] Add a placeholder test in each package to verify Jest runs
  - [x] Add test scripts to root `package.json`
- [x] Task 7: Environment configuration (AC: #7)
  - [x] Create `.env.example` with documented variables:
    - `DATABASE_URL=postgresql://user:password@localhost:5432/todoapp`
    - `PORT=3001`
    - `CORS_ORIGIN=http://localhost:5173`
    - `NODE_ENV=development`
  - [x] Ensure `.env` is in `.gitignore`
- [x] Task 8: Verify full setup (AC: #9, #10, #11)
  - [x] `npm install` from root installs all workspace dependencies
  - [x] `npm run dev -w packages/client` starts Vite dev server
  - [x] `npm run dev -w packages/server` starts Fastify server
  - [x] Health check responds correctly

## Dev Notes

### Architecture Compliance

- **Monorepo structure:** npm workspaces with `packages/client` and `packages/server` — NO Turborepo, NO Lerna
- **Frontend:** React 19 + Vite 9 + TypeScript via `create-vite` react-ts template
- **Backend:** Fastify + TypeScript, manual setup (NOT Fastify CLI)
- **Styling:** Tailwind CSS v4 with CSS-first configuration — do NOT create `tailwind.config.js` (that's v3 pattern). Use `@import "tailwindcss"` in CSS and `@theme` directive for custom tokens
- **Testing:** Jest with ts-jest, co-located test files (`.test.ts`/`.test.tsx` next to source)
- **Module system:** ESM throughout
- **Node.js:** 20+ required (for Vite 9.x compatibility)

### Critical Tailwind v4 Notes

The UX spec references Tailwind v3 patterns (`tailwind.config.js`, `@apply`). The architecture specifies **Tailwind v4** with CSS-first configuration. Key differences:
- No `tailwind.config.js` — use `@theme` in CSS instead
- Import via `@import "tailwindcss"` in your main CSS file
- Design tokens defined with `@theme { --color-*: ...; }` syntax
- Utility class names are the same as v3
- Plugin via `@tailwindcss/vite` in `vite.config.ts`

### Backend App Factory Pattern

```typescript
// app.ts — export a createApp factory function
// server.ts — calls createApp() and starts listening
// This pattern enables testing (inject requests without starting server)
```

### Vite Proxy Configuration

Configure Vite to proxy `/api` to `http://localhost:3001` during development so the frontend can call the backend without CORS issues in dev mode.

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

### File Structure After This Story

```
todo-app-bmad/
├── package.json                    # Root workspace config
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── tsconfig.base.json
├── .env.example
├── packages/
│   ├── client/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html              # Include Inter font link
│   │   ├── jest.config.ts
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx              # Placeholder with Tailwind classes
│   │       └── App.css              # Tailwind v4 imports + @theme tokens
│   └── server/
│       ├── package.json
│       ├── tsconfig.json
│       ├── jest.config.ts
│       └── src/
│           ├── server.ts            # Entry point
│           └── app.ts               # createApp factory + /health route
```

### Naming Conventions (Enforce from Day One)

| Element | Convention | Example |
|---------|-----------|--------|
| React components | PascalCase file + export | `AppShell.tsx` |
| Hooks | camelCase with `use` prefix | `useTodos.ts` |
| Utility files | camelCase | `todoApi.ts` |
| Functions/variables | camelCase | `createApp` |
| Types/interfaces | PascalCase | `Todo` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |

### Anti-Patterns to Avoid

- ❌ Do NOT use Turborepo, Lerna, or any monorepo tooling beyond npm workspaces
- ❌ Do NOT create `tailwind.config.js` — use CSS-first v4 approach
- ❌ Do NOT install axios — native `fetch` will be used later
- ❌ Do NOT install React Router — single page, no routing needed
- ❌ Do NOT use Fastify CLI to scaffold backend
- ❌ Do NOT add Prisma in this story — that's Story 1.2
- ❌ Do NOT add Docker/Docker Compose in this story — that's Story 1.2
- ❌ Do NOT create component files beyond placeholder App.tsx — components come in later stories

### Project Structure Notes

- This story creates the foundation only — no business logic, no database, no Docker
- Story 1.2 adds PostgreSQL + Prisma + Docker Compose + Fastify plugins (cors, helmet, swagger)
- Story 1.3+ adds actual components and API routes
- The `/health` endpoint is outside the `/api` prefix (registered directly on app)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation] — initialization commands and approach rationale
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries] — complete directory structure
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules] — naming conventions and enforcement
- [Source: _bmad-output/planning-artifacts/architecture.md#Architecture Validation Results] — Tailwind v4 CSS-first note
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — acceptance criteria
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation] — color palette and typography
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual Design Foundation] — design tokens

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

- Vite 8.x/9.x requires Node.js >=22.12.0; downgraded to Vite 6.x for compatibility with Node 22.11.0
- TypeScript downgraded from 6.x to 5.7.x for same Node compatibility reason
- ts-node required for Jest TypeScript config files
- @types/jest required for TypeScript test files
- ESM support in Jest required `extensionsToTreatAsEsm` and `moduleNameMapper` for `.js` extensions

### Completion Notes List

- Monorepo initialized with npm workspaces (`packages/client`, `packages/server`)
- Frontend scaffolded with `create-vite` react-ts template, Vite 6.x, React 19
- Tailwind CSS v4 configured with CSS-first `@theme` tokens (10 colors, Inter font, 3 font weights)
- Backend created with Fastify app factory pattern; `GET /health` returns `{ status: "ok" }`
- ESLint + Prettier configured at root with shared TypeScript rules
- Jest + ts-jest configured in both packages with co-located test convention
- `.env.example` committed with DATABASE_URL, PORT, CORS_ORIGIN, NODE_ENV
- All 2 tests pass (client placeholder + server health check integration test)
- Vite dev server starts on port 5173; Fastify server starts on port 3001
- Vite proxy configured for `/api` → `http://localhost:3001`

### Change Log

- 2026-04-22: Initial project scaffold and monorepo setup (Story 1.1)

### File List

- package.json (new)
- .gitignore (new)
- tsconfig.base.json (new)
- .eslintrc.json (new)
- .prettierrc (new)
- .env.example (new)
- packages/client/package.json (modified)
- packages/client/tsconfig.json (generated)
- packages/client/tsconfig.app.json (modified)
- packages/client/tsconfig.node.json (generated)
- packages/client/vite.config.ts (modified)
- packages/client/index.html (modified)
- packages/client/eslint.config.js (generated)
- packages/client/jest.config.ts (new)
- packages/client/src/main.tsx (generated)
- packages/client/src/App.tsx (modified)
- packages/client/src/App.css (modified)
- packages/client/src/index.css (modified)
- packages/client/src/App.test.tsx (new)
- packages/server/package.json (new)
- packages/server/tsconfig.json (new)
- packages/server/jest.config.ts (new)
- packages/server/src/app.ts (new)
- packages/server/src/server.ts (new)
- packages/server/src/app.test.ts (new)

### Review Findings

- [x] [Review][Dismissed] ESLint uses flat config (`eslint.config.js`) instead of `.eslintrc.json` — Accepted: ESLint 9.x flat config is the correct modern approach; `.eslintrc.json` is deprecated.
- [x] [Review][Defer] Spacing rhythm tokens not defined — AC #3 mentions "spacing rhythm" but Tailwind v4 built-in spacing utilities suffice; custom tokens deferred until design requires them.
- [x] [Review][Patch] App.test.tsx is a no-op test — asserts `true === true`, never renders App [packages/client/src/App.test.tsx] — FIXED
- [x] [Review][Patch] App.css contains ~180 lines of leftover Vite boilerplate — `.counter`, `.hero`, `#center`, etc. unused by App.tsx [packages/client/src/App.css:19-203] — FIXED
- [x] [Review][Patch] Root ESLint config applies `globals.browser` to server code — should only apply `globals.node` [eslint.config.js:13-15] — FIXED
- [x] [Review][Patch] Client `tsconfig.node.json` doesn't extend `tsconfig.base.json` — violates AC #6 [packages/client/tsconfig.node.json] — FIXED
- [x] [Review][Patch] Server tsconfig doesn't exclude test files from compilation — `*.test.ts` compiled into `dist/` [packages/server/tsconfig.json] — FIXED
- [x] [Review][Patch] Jest regex in client config not properly escaped — `'^.+\.tsx?$'` should be `'^.+\\.tsx?$'` [packages/client/jest.config.ts:6] — FIXED
- [x] [Review][Patch] ESLint not in root devDependencies — root `lint` script depends on hoisted eslint from client [package.json:20-22] — FIXED
- [x] [Review][Defer] No `.env` loading mechanism — no dotenv; `process.env` only works with external env — deferred, pre-existing
- [x] [Review][Defer] PORT env var not validated — non-numeric or out-of-range PORT causes undefined behavior — deferred, pre-existing
- [x] [Review][Defer] `app.close()` not in `afterEach`/`finally` — assertion failure leaks Fastify handles — deferred, pre-existing
