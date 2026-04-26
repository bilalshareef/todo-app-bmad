# Story 1.2: Database Setup & API Foundation

Status: ready-for-dev

## Story

As a developer,
I want a PostgreSQL database with the Todo model and a running Fastify API with core plugins,
So that the backend is ready to serve todo data.

## Acceptance Criteria

1. **Given** the monorepo from Story 1.1 exists **When** Docker Compose is started **Then** a PostgreSQL container is running and accessible from the backend
2. **And** `prisma/schema.prisma` defines the Todo model with fields: id (UUID, default), text (String), completed (Boolean, default false), createdAt (DateTime, default now), updatedAt (DateTime, auto-updated)
3. **And** `prisma migrate dev` creates the database tables successfully
4. **And** a Prisma client plugin (`plugins/prisma.ts`) decorates the Fastify instance with the Prisma client
5. **And** `@fastify/cors` is configured for the frontend origin
6. **And** `@fastify/helmet` is registered for security headers
7. **And** `@fastify/swagger` and `@fastify/swagger-ui` are configured and available at `/docs` in development
8. **And** all todo routes are registered under the `/api` prefix using Fastify plugin encapsulation
9. **And** the global `setErrorHandler` catches unhandled errors, logs via Pino, and returns generic 500 with no internal details

## Tasks / Subtasks

- [ ] Task 1: Create Docker Compose for local PostgreSQL (AC: #1)
  - [ ] Create `docker-compose.yml` at project root with PostgreSQL 17-alpine service
  - [ ] Configure `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` env vars matching `DATABASE_URL` in `.env.example`
  - [ ] Mount a named volume for data persistence (`pgdata:/var/lib/postgresql/data`)
  - [ ] Set `shm_size: 128mb` to avoid shared memory issues
  - [ ] Expose port 5432 to host
  - [ ] Verify `docker compose up -d` starts PostgreSQL successfully
- [ ] Task 2: Install and configure Prisma ORM (AC: #2, #3)
  - [ ] Install `prisma` (devDependency) and `@prisma/client` in `packages/server`
  - [ ] Install `@prisma/adapter-pg` and `pg` driver (Prisma v7 requires driver adapters)
  - [ ] Create `packages/server/prisma.config.ts` (required in v7) — configure datasource URL from env, schema path, migrations path
  - [ ] Run `npx prisma init` from `packages/server/` to scaffold `prisma/schema.prisma`
  - [ ] Define the Todo model in `schema.prisma`:
    ```prisma
    model Todo {
      id        String   @id @default(uuid())
      text      String
      completed Boolean  @default(false)
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
    }
    ```
  - [ ] Configure the Prisma generator with `provider = "prisma-client"` and explicit `output` path (v7 requirement — client no longer generates into node_modules)
  - [ ] Run `npx prisma migrate dev --name init` to create the initial migration
  - [ ] Run `npx prisma generate` explicitly (v7 no longer auto-generates after migrate)
  - [ ] Verify migration creates the `Todo` table in PostgreSQL
- [ ] Task 3: Create Prisma Fastify plugin (AC: #4)
  - [ ] Install `fastify-plugin` in `packages/server`
  - [ ] Create `packages/server/src/plugins/prisma.ts`
  - [ ] Import PrismaClient from the generated output path (NOT from `@prisma/client` — v7 change)
  - [ ] Import `PrismaPg` from `@prisma/adapter-pg` and configure the adapter
  - [ ] Instantiate PrismaClient with the `PrismaPg` adapter
  - [ ] Decorate Fastify instance with `prisma` property
  - [ ] Add TypeScript declaration merging for `FastifyInstance.prisma`
  - [ ] Register `onClose` hook to call `prisma.$disconnect()`
  - [ ] Wrap with `fastify-plugin` to share across encapsulation contexts
- [ ] Task 4: Create CORS plugin (AC: #5)
  - [ ] Create `packages/server/src/plugins/cors.ts`
  - [ ] Import `@fastify/cors` (already installed in Story 1.1)
  - [ ] Configure `origin` from `process.env.CORS_ORIGIN` (defaults to `http://localhost:5173`)
  - [ ] Wrap with `fastify-plugin`
- [ ] Task 5: Create Helmet plugin (AC: #6)
  - [ ] Create `packages/server/src/plugins/helmet.ts`
  - [ ] Import `@fastify/helmet` (already installed in Story 1.1)
  - [ ] Register with default security headers (`{ global: true }`)
  - [ ] Wrap with `fastify-plugin`
- [ ] Task 6: Create Swagger plugin (AC: #7)
  - [ ] Install `@fastify/swagger` and `@fastify/swagger-ui` in `packages/server`
  - [ ] Create `packages/server/src/plugins/swagger.ts`
  - [ ] Register `@fastify/swagger` with OpenAPI v3 spec (title: "Todo API", version: "1.0.0")
  - [ ] Register `@fastify/swagger-ui` at route prefix `/docs`
  - [ ] Configure CSP in helmet to allow Swagger UI inline scripts/styles (required for compatibility)
  - [ ] Only register swagger plugins when `NODE_ENV !== 'production'`
  - [ ] Wrap with `fastify-plugin`
- [ ] Task 7: Create API route prefix with plugin encapsulation (AC: #8)
  - [ ] Create `packages/server/src/routes/todos.ts` as a Fastify plugin
  - [ ] Register a placeholder GET route at `/` (within the plugin) that returns `{ data: [] }`
  - [ ] Register the todos plugin under the `/api/todos` prefix in `app.ts`
  - [ ] Verify all routes under `/api` are properly encapsulated
- [ ] Task 8: Add global error handler (AC: #9)
  - [ ] Add `setErrorHandler` to the Fastify app in `app.ts`
  - [ ] Log errors via Pino (`request.log.error(error)`)
  - [ ] Return generic 500 response: `{ statusCode: 500, error: "Internal Server Error", message: "An unexpected error occurred" }`
  - [ ] Never expose stack traces, database errors, or internal details
  - [ ] Ensure JSON Schema validation errors (400s) still use Fastify's default error format
- [ ] Task 9: Wire all plugins into app.ts (AC: #4, #5, #6, #7, #8, #9)
  - [ ] Register plugins in correct order: helmet → cors → prisma → swagger → routes
  - [ ] Register swagger BEFORE routes (required for route discovery)
  - [ ] Keep `/health` endpoint registered directly on app (outside `/api` prefix)
- [ ] Task 10: Write tests (AC: all)
  - [ ] Write integration test: Prisma connects to test database and creates/reads a Todo
  - [ ] Write integration test: `/health` still returns `{ status: "ok" }`
  - [ ] Write integration test: placeholder GET `/api/todos` returns `{ data: [] }`
  - [ ] Write integration test: global error handler returns 500 without internal details
  - [ ] Write integration test: CORS headers present in response
  - [ ] Write integration test: Swagger UI accessible at `/docs` in development
  - [ ] Verify all existing tests still pass (no regressions)

## Dev Notes

### Critical: Prisma v7 Breaking Changes

Prisma v7 is a **major paradigm shift** from v6. The architecture doc references Prisma patterns but was written before v7 shipped. Key differences:

1. **ESM-only** — Prisma v7 is pure ESM. The server package already has `"type": "module"` so this is compatible.
2. **Driver adapters required** — No more built-in Rust query engine. Must use `@prisma/adapter-pg` + `pg` for PostgreSQL.
3. **`prisma.config.ts` required** — New config file at `packages/server/prisma.config.ts`. Env vars are NOT auto-loaded; use `import 'dotenv/config'` if needed.
4. **Generator output is explicit** — Use `provider = "prisma-client"` (not `prisma-client-js`). The `output` field is **required** — PrismaClient no longer generates into `node_modules`. Set output to a local path like `./generated/prisma`.
5. **Import path changes** — Import PrismaClient from the generated output path (e.g., `../../generated/prisma/client.js`), NOT from `@prisma/client`.
6. **`prisma migrate dev` no longer auto-generates** — Must run `npx prisma generate` explicitly after migrations.
7. **No auto-seeding** — `prisma db seed` must be run explicitly if seeding is needed.

### Prisma Schema Setup

```prisma
// packages/server/prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Todo {
  id        String   @id @default(uuid())
  text      String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Prisma Config File (v7 Requirement)

```typescript
// packages/server/prisma.config.ts
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, 'prisma/schema.prisma'),
})
```

### Prisma Plugin Pattern (v7 with Driver Adapter)

```typescript
// packages/server/src/plugins/prisma.ts
import fp from 'fastify-plugin'
import { PrismaClient } from '../../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export default fp(async (fastify) => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
})
```

### Docker Compose Setup

```yaml
# docker-compose.yml (project root)
services:
  db:
    image: postgres:17-alpine
    restart: unless-stopped
    shm_size: 128mb
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: todoapp
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

The `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` values must match the `DATABASE_URL` in `.env.example`: `postgresql://user:password@localhost:5432/todoapp`

### Plugin Registration Order

Plugins must be registered in `app.ts` in this order:
1. **helmet** — security headers (must be first for all responses)
2. **cors** — CORS headers
3. **prisma** — database connection
4. **swagger** — API documentation (must be before routes for route discovery)
5. **routes** — API route handlers

### Swagger + Helmet CSP Compatibility

When using `@fastify/helmet` with `@fastify/swagger-ui`, Helmet's default CSP blocks Swagger UI's inline scripts/styles. Configure helmet to relax CSP for the `/docs` route:

```typescript
// In helmet plugin or app.ts configuration
fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "validator.swagger.io"],
    },
  },
})
```

Alternatively, disable CSP globally if only serving API (no frontend from same origin in production).

### Route Encapsulation Pattern

```typescript
// packages/server/src/routes/todos.ts
import { FastifyPluginAsync } from 'fastify'

const todosRoutes: FastifyPluginAsync = async (fastify) => {
  // Placeholder - will be implemented in Story 1.3
  fastify.get('/', async () => {
    return { data: [] }
  })
}

export default todosRoutes
```

Register in `app.ts`:
```typescript
app.register(todosRoutes, { prefix: '/api/todos' })
```

### Global Error Handler

```typescript
app.setErrorHandler((error, request, reply) => {
  // JSON Schema validation errors — let Fastify handle naturally
  if (error.validation) {
    reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
    })
    return
  }

  // Log the full error for debugging
  request.log.error(error)

  // Return generic error — never expose internals
  reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  })
})
```

### Environment Variables

The existing `.env.example` already has `DATABASE_URL`, `PORT`, `CORS_ORIGIN`, and `NODE_ENV`. No additions needed. Ensure `.env` is created from `.env.example` before running:
```bash
cp .env.example .env
```

### Testing Strategy

Tests should use the app factory pattern established in Story 1.1 (`createApp()`). For database integration tests:
- Use a separate test database (e.g., `todoapp_test`)
- Or use Prisma's built-in test utilities
- The app factory should accept options to configure test-specific settings
- Use Fastify's `inject()` method for HTTP-level testing without starting the server

### Deferred Work from Story 1.1

The following items were deferred from Story 1.1's code review and are **NOT in scope** for this story:
- No `.env` loading mechanism (dotenv) — continue using external env setup for now
- PORT env var validation — not blocking
- `app.close()` cleanup in tests — should be addressed but not a blocker
- Spacing rhythm tokens — not relevant to this story

### Project Structure Notes

Files created/modified in this story:
```
todo-app-bmad/
├── docker-compose.yml                    # NEW — PostgreSQL local dev
├── packages/
│   └── server/
│       ├── package.json                  # MODIFIED — add prisma, @prisma/adapter-pg, pg, fastify-plugin, swagger deps
│       ├── prisma.config.ts              # NEW — Prisma v7 config
│       ├── prisma/
│       │   ├── schema.prisma             # NEW — Todo model
│       │   └── migrations/              # NEW — auto-generated by prisma migrate
│       ├── generated/
│       │   └── prisma/                  # NEW — auto-generated Prisma client (gitignore this)
│       └── src/
│           ├── app.ts                    # MODIFIED — register plugins, error handler
│           ├── app.test.ts               # MODIFIED — add new integration tests
│           ├── plugins/
│           │   ├── prisma.ts             # NEW — Prisma client plugin
│           │   ├── cors.ts               # NEW — CORS configuration
│           │   ├── helmet.ts             # NEW — Security headers
│           │   └── swagger.ts            # NEW — API docs (dev only)
│           └── routes/
│               └── todos.ts             # NEW — placeholder todo routes
```

**IMPORTANT:** Add `packages/server/generated/` to `.gitignore` — the generated Prisma client should not be committed.

### Anti-Patterns to Avoid

- ❌ Do NOT use Prisma v6 patterns (`prisma-client-js` provider, importing from `@prisma/client`)
- ❌ Do NOT skip `prisma.config.ts` — it's required in v7
- ❌ Do NOT expect `prisma migrate dev` to auto-generate the client — run `prisma generate` explicitly
- ❌ Do NOT put business logic in route handlers — keep them thin (routes → services → Prisma)
- ❌ Do NOT create service files in this story — services come in Story 1.3
- ❌ Do NOT create actual CRUD route handlers — only the placeholder GET returning `{ data: [] }`
- ❌ Do NOT install dotenv — env loading mechanism is deferred
- ❌ Do NOT expose stack traces or database errors in API responses
- ❌ Do NOT register swagger plugins in production (`NODE_ENV === 'production'`)
- ❌ Do NOT use `console.log` — use Fastify's built-in Pino logger

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions] — data model, API patterns, security middleware
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules] — routes → services → Prisma layering, error handling patterns
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries] — complete directory structure, backend organization
- [Source: _bmad-output/planning-artifacts/architecture.md#Development Workflow] — Docker Compose workflow, local dev steps
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2] — acceptance criteria
- [Source: _bmad-output/planning-artifacts/prd.md#Additional Requirements] — database, API, security, auth-ready structure
- [Source: _bmad-output/implementation-artifacts/1-1-project-scaffold-and-monorepo-setup.md] — existing codebase, app factory pattern, naming conventions
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] — deferred items from Story 1.1 code review

## Previous Story Intelligence

### From Story 1.1 Implementation

- **App factory pattern** established: `createApp()` in `app.ts`, called from `server.ts`. Extend this pattern — do NOT restructure.
- **ESM throughout**: Both packages use `"type": "module"`. Import paths need `.js` extensions for Node.js ESM resolution.
- **TypeScript version**: Downgraded from 6.x to 5.7.x for Node compatibility. Prisma v7 requires TypeScript >= 5.4.0, so this is compatible.
- **Vite version**: Downgraded from 9.x to 6.x for Node compatibility. Not relevant to this story but informational.
- **Node.js version**: 22.11.0 (confirmed by Story 1.1 debug log). Prisma v7 requires >= 20.19.0, so this is compatible.
- **Existing dependencies**: `@fastify/cors` ^11.0.0 and `@fastify/helmet` ^13.0.0 are already installed. Do NOT reinstall them.
- **Test infrastructure**: Jest with ts-jest configured. `ts-node` required for TypeScript config files. `@types/jest` installed.
- **ESLint config**: Uses root `eslint.config.js` (flat config). No `.eslintrc.json` despite Story 1.1 spec mentioning it — the flat config format was used instead.

### Key Patterns Established

- Health check at `GET /health` returns `{ status: "ok" }` directly (no envelope)
- Fastify logger enabled: `Fastify({ logger: true })`
- Server listens on `0.0.0.0` (all interfaces)
- Port from `process.env.PORT || '3001'`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
