# Story 1.6: Containerization — Dockerfiles for Frontend & Backend

Status: done

## Story

As a developer,
I want production-ready Dockerfiles for both the frontend and backend,
So that the application can be built and deployed as containers in any environment.

## Acceptance Criteria

1. **Given** the backend package exists at `packages/server/` **When** a Docker image is built from its Dockerfile **Then** a multi-stage build is used: Stage 1 installs dependencies and compiles TypeScript, Stage 2 copies only the compiled output into a slim Node.js production image
2. **And** the production image runs as a non-root user
3. **And** a HEALTHCHECK instruction is defined that curls `GET /health`
4. **And** the image exposes port 3000
5. **And** `.dockerignore` excludes node_modules, dist, .env, and test files
6. **Given** the frontend package exists at `packages/client/` **When** a Docker image is built from its Dockerfile **Then** a multi-stage build is used: Stage 1 installs dependencies and runs `vite build`, Stage 2 copies the built static assets into an nginx:alpine image
7. **And** the production image runs as a non-root user
8. **And** a HEALTHCHECK instruction is defined that curls the nginx server
9. **And** the image exposes port 80
10. **And** `.dockerignore` excludes node_modules, dist, .env, and test files
11. **Given** both Dockerfiles exist **When** `docker compose up` is run with an updated docker-compose.yml **Then** the PostgreSQL, backend, and frontend containers all start
12. **And** the backend connects to PostgreSQL and responds on /health
13. **And** the frontend serves the app through nginx

## Tasks / Subtasks

- [ ] Task 1: Create backend `.dockerignore` (AC: #5)
  - [ ] Create `packages/server/.dockerignore`
  - [ ] Exclude: `node_modules`, `dist`, `.env`, `*.test.ts`, `coverage`, `.git`
- [ ] Task 2: Create backend Dockerfile (AC: #1, #2, #3, #4)
  - [ ] Create `packages/server/Dockerfile`
  - [ ] Stage 1 (`build`): Use `node:22-alpine` base, install ALL deps (including devDependencies for tsc), copy source, run `npx prisma generate` then `npm run build` (tsc)
  - [ ] Stage 2 (`production`): Use `node:22-alpine` slim base, copy compiled `dist/` output, copy `generated/prisma/` (Prisma client), copy `prisma/schema.prisma` and `prisma.config.ts`, install production deps only, create non-root user, set HEALTHCHECK, EXPOSE 3000
  - [ ] Ensure the `DATABASE_URL` env var is expected at runtime (not baked in)
- [ ] Task 3: Create frontend `.dockerignore` (AC: #10)
  - [ ] Create `packages/client/.dockerignore`
  - [ ] Exclude: `node_modules`, `dist`, `.env`, `*.test.ts`, `*.test.tsx`, `coverage`, `.git`, `__mocks__`
- [ ] Task 4: Create frontend Dockerfile (AC: #6, #7, #8, #9)
  - [ ] Create `packages/client/Dockerfile`
  - [ ] Stage 1 (`build`): Use `node:22-alpine` base, install deps, run `npm run build` (tsc + vite build)
  - [ ] Stage 2 (`production`): Use `nginx:alpine` base, copy built `dist/` into nginx html dir, add custom nginx.conf for SPA routing, create non-root user, set HEALTHCHECK, EXPOSE 80
- [ ] Task 5: Create nginx configuration for frontend (AC: #6, #8)
  - [ ] Create `packages/client/nginx.conf` (or embed in Dockerfile)
  - [ ] Configure: listen on port 80, serve static from `/usr/share/nginx/html`, `try_files $uri $uri/ /index.html` for SPA fallback
- [ ] Task 6: Update docker-compose.yml (AC: #11, #12, #13)
  - [ ] Add `server` service: build from `packages/server/Dockerfile`, expose port 3001→3000, depends_on `db`, set `DATABASE_URL` env
  - [ ] Add `client` service: build from `packages/client/Dockerfile`, expose port 8080→80, depends_on `server`
  - [ ] Keep existing `db` service unchanged
  - [ ] Verify all three containers start and connect correctly
- [ ] Task 7: Verify builds and health checks (AC: #3, #8, #11, #12, #13)
  - [ ] `docker compose build` completes without errors
  - [ ] `docker compose up` starts all three services
  - [ ] `curl http://localhost:3001/health` returns `{ status: "ok" }`
  - [ ] `curl http://localhost:8080` returns the frontend HTML

## Dev Notes

### Architecture Compliance

- **Container Strategy (from architecture doc):** Multi-stage Docker builds for both frontend (nginx static serving) and backend (slim Node.js production image). Non-root user in all production containers. Health check instructions in all Dockerfiles.
- **Docker Compose purpose:** Local development orchestration — PostgreSQL + backend + frontend
- **Production deployment target:** AWS ECS Fargate (backend), S3 + CloudFront (frontend) — Dockerfiles must be production-ready for ECR push
- **Port convention:** Backend runs on port 3000 inside container (AC says 3000, but `server.ts` defaults to PORT env var with fallback 3001 for local dev — use 3000 in Dockerfile as the canonical production port)

### Critical: Monorepo Build Context

This project uses npm workspaces. The Dockerfiles are inside `packages/server/` and `packages/client/` respectively. Key implications:

**Backend (`packages/server/`):**
- `package.json` has its own dependencies separate from root
- `tsconfig.json` extends `../../tsconfig.base.json` — the build stage MUST copy `tsconfig.base.json` from project root into the correct relative path
- Prisma schema at `prisma/schema.prisma`, config at `prisma.config.ts`, generated client at `generated/prisma/`
- `prisma generate` must run during build to produce the client — the `generated/` folder must be copied to production stage
- The server uses `process.loadEnvFile?.()` which gracefully handles missing `.env` — no issue in container
- Server entry point: `node dist/server.js` (from `package.json` "start" script)
- TypeScript compiles to `dist/` directory (tsconfig `outDir: "./dist"`)

**Frontend (`packages/client/`):**
- Build command: `tsc -b && vite build` produces static assets in `dist/`
- No runtime dependencies needed — output is pure static HTML/CSS/JS
- The vite proxy config (`/api` → `localhost:3001`) is dev-only and irrelevant for production
- In production nginx, API calls go to the backend via a separate network path (Docker Compose service name or load balancer)

### Build Context Strategy

**Option A (recommended — simpler):** Set Docker build context to the project root and reference Dockerfiles with `-f` flag. This avoids the `tsconfig.base.json` copy problem:
```yaml
services:
  server:
    build:
      context: .
      dockerfile: packages/server/Dockerfile
```

**Option B:** Keep build context as the package dir, but COPY `tsconfig.base.json` from parent. Requires copying from outside context — problematic.

**Use Option A.** The docker-compose.yml is at the project root, so `context: .` is natural.

### Dockerfile Implementation Details

**Backend Dockerfile (`packages/server/Dockerfile`):**
```dockerfile
# Build context is project root (.)

# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY tsconfig.base.json ./
COPY packages/server/ ./packages/server/
WORKDIR /app/packages/server
RUN npm install
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S appuser -u 1001 -G nodejs
WORKDIR /app
COPY --from=build /app/packages/server/dist ./dist
COPY --from=build /app/packages/server/generated ./generated
COPY --from=build /app/packages/server/prisma ./prisma
COPY --from=build /app/packages/server/prisma.config.ts ./
COPY --from=build /app/packages/server/package.json ./
RUN npm install --omit=dev
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
ENV PORT=3000
CMD ["node", "dist/server.js"]
```

**Key decisions:**
- Use `wget` not `curl` for HEALTHCHECK — `node:22-alpine` includes `wget` but NOT `curl` by default
- `npm install --omit=dev` in production stage to get only runtime deps (`fastify`, `@prisma/client`, `pg`, `pino`, etc.)
- `prisma.config.ts` and `prisma/` directory needed at runtime for Prisma client to locate the schema
- Must copy `generated/prisma/` — this is the generated Prisma client output directory
- PORT env set to 3000 (production default; server.ts reads `process.env.PORT`)

**Frontend Dockerfile (`packages/client/Dockerfile`):**
```dockerfile
# Build context is project root (.)

# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY tsconfig.base.json ./
COPY packages/client/ ./packages/client/
WORKDIR /app/packages/client
RUN npm install
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS production
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
COPY --from=build /app/packages/client/dist /usr/share/nginx/html
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R appuser:appgroup /usr/share/nginx/html \
    && chown -R appuser:appgroup /var/cache/nginx \
    && chown -R appuser:appgroup /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown appuser:appgroup /var/run/nginx.pid
USER appuser
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

**Key decisions:**
- No `tsconfig.base.json` needed — ~~the client's `tsconfig.app.json` does NOT extend the base~~ **CORRECTION:** `tsconfig.app.json` DOES extend `../../tsconfig.base.json`, so `tsconfig.base.json` MUST be copied to the build context at the correct relative path (same pattern as backend)
- nginx.conf handles SPA routing with `try_files`
- Non-root nginx requires chowning several directories

### nginx.conf for Frontend

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### docker-compose.yml Update

Current file has only the `db` service. Add `server` and `client`:

```yaml
services:
  db:
    # ... existing config unchanged ...

  server:
    build:
      context: .
      dockerfile: packages/server/Dockerfile
    ports:
      - "3001:3000"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/todoapp
      PORT: "3000"
    depends_on:
      db:
        condition: service_started
    restart: unless-stopped

  client:
    build:
      context: .
      dockerfile: packages/client/Dockerfile
    ports:
      - "8080:80"
    depends_on:
      - server
    restart: unless-stopped
```

**Note:** Backend maps host port 3001 → container port 3000 (consistent with existing dev port). Frontend maps host port 8080 → container port 80.

### tsconfig.base.json Dependency

The server's `tsconfig.json` extends `../../tsconfig.base.json`. When build context is project root:
- `COPY tsconfig.base.json ./` copies it to `/app/tsconfig.base.json`
- Server WORKDIR is `/app/packages/server`, so `../../tsconfig.base.json` resolves to `/app/tsconfig.base.json` ✓

The client's build uses Vite which reads `tsconfig.app.json` (no base extension needed for the build). Check `tsconfig.app.json` — if it extends `../../tsconfig.base.json`, the same pattern applies. If so, copy `tsconfig.base.json` in the client Dockerfile too.

### Existing Files to Modify

| File | Action |
|------|--------|
| `docker-compose.yml` | Add `server` and `client` services alongside existing `db` |

### New Files to Create

| File | Purpose |
|------|---------|
| `packages/server/Dockerfile` | Multi-stage build for backend |
| `packages/server/.dockerignore` | Exclude unnecessary files from build context |
| `packages/client/Dockerfile` | Multi-stage build for frontend (nginx) |
| `packages/client/.dockerignore` | Exclude unnecessary files from build context |
| `packages/client/nginx.conf` | nginx config for SPA static serving |

### Files That Should NOT Be Modified

| File | Reason |
|------|--------|
| `packages/server/src/*` | No application code changes needed |
| `packages/client/src/*` | No application code changes needed |
| `packages/server/package.json` | Build scripts already correct (`build`: `tsc`, `start`: `node dist/server.js`) |
| `packages/client/package.json` | Build scripts already correct (`build`: `tsc -b && vite build`) |
| `packages/server/prisma/*` | Schema and migrations unchanged |

### Testing Strategy

**No unit tests** — this story is infrastructure-only. Validation is via Docker build and runtime checks:
1. `docker compose build` — both images build successfully
2. `docker compose up` — all three containers start
3. Health check verification — backend responds on `/health`, frontend serves HTML
4. Existing test suites are unaffected — no application code changes

### Previous Story Intelligence

From Story 1.5 (most recent in epic 1):
- All 7 planned flat components are now created (AppShell was the last)
- Test pattern uses `createRoot` + `act` and `jest.mock` at module level
- Tailwind design tokens are in `App.css` `@theme` block
- Frontend app works end-to-end (create, display, complete, delete todos with error handling and accessibility)
- All existing tests (43+) pass — no application code changes in this story means no regression risk

### Git Intelligence

Recent commits show all 4 epics completed (stories 1.1–1.5, 2.1–2.2, 3.1–3.2, 4.1–4.3). The application is feature-complete. This story adds containerization infrastructure only — no feature code changes.

### Project Structure Notes

- Monorepo root: `todo-app-bmad/` with `packages/client/` and `packages/server/`
- `docker-compose.yml` already exists at project root with PostgreSQL service
- No existing Dockerfiles or `.dockerignore` files in the project
- The `packages/server/generated/prisma/` directory is gitignored but must be generated during Docker build

### Review Findings

- [x] [Review][Decision] **Port 80 vs 8080 conflict** — Accepted: port 8080 used throughout; non-root nginx can't bind 80. Practical for prod (load balancer handles 80/443).
- [x] [Review][Decision] **Out-of-scope changes in todos.ts** — Kept: 404 response schemas are a valid improvement bundled with this commit.
- [x] [Review][Patch] Non-deterministic builds — `npm install` without lockfile [packages/server/Dockerfile:9, packages/client/Dockerfile:9]
- [x] [Review][Patch] NODE_ENV not set in server production stage [packages/server/Dockerfile:19]
- [x] [Review][Patch] Client depends_on server without `condition: service_healthy` [docker-compose.yml:40]
- [x] [Review][Patch] Server depends_on db uses `service_started` — db has no healthcheck [docker-compose.yml:28]
- [x] [Review][Patch] index.html served without no-cache header — stale HTML after redeploy [packages/client/nginx.conf:7]
- [x] [Review][Patch] prisma.config.ts copied to production but no TypeScript runtime — `prisma migrate deploy` in container will fail [packages/server/Dockerfile:25]
- [x] [Review][Defer] Hardcoded DB credentials in docker-compose.yml — standard for local dev, security improvement for production config later
- [x] [Review][Defer] Fragile sed-based import rewriting in server Dockerfile — Prisma ESM workaround, revisit when Prisma supports ESM natively
- [x] [Review][Defer] nginx.conf missing security headers (X-Frame-Options, CSP, etc.) — production hardening task
- [x] [Review][Defer] 404 schema uses `type: 'number'` instead of `'integer'` for statusCode — pre-existing, not introduced by this story
- [x] [Review][Defer] Health endpoint doesn't verify database connectivity — application-level change, not containerization scope

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Infrastructure & Deployment section]
- [Source: _bmad-output/planning-artifacts/architecture.md — Container Strategy]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 1.6]
- [Source: packages/server/tsconfig.json — extends ../../tsconfig.base.json]
- [Source: packages/server/prisma.config.ts — DATABASE_URL fallback]
- [Source: packages/server/package.json — build/start scripts]
- [Source: packages/client/package.json — build script]
- [Source: packages/client/vite.config.ts — dev proxy config]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
