---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'architecture'
project_name: 'todo-app-bmad'
user_name: 'Bilal'
date: 'April 22, 2026'
lastStep: 8
status: 'complete'
completedAt: 'April 22, 2026'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
24 functional requirements across 7 categories covering the complete todo CRUD lifecycle. The requirements are straightforward — no complex business rules, no conditional workflows, no computed or derived data. The most architecturally significant requirements are the error handling group (FR14–FR18) which mandate optimistic UI with rollback and the "no false persistence" rule (FR18), and the application states group (FR19–FR21) which requires the input field to remain usable across all app states.

**Non-Functional Requirements:**
17 NFRs that will shape architectural decisions:
- **Performance (NFR1–5):** Bundle < 200KB gzipped, FCP < 1s, CRUD ops < 300ms. Generous for this scope but rules out heavy frameworks.
- **Security (NFR6–9):** Server-side input validation, no stack trace exposure, auth-ready API structure.
- **Reliability (NFR10–13):** Durable persistence, proper HTTP status codes, no unhandled exceptions, failed ops don't corrupt state.
- **Accessibility (NFR14–17):** Keyboard navigation, screen reader labels, WCAG AA contrast, visible focus indicators.

**Scale & Complexity:**

- Primary domain: Full-stack web (SPA + REST API)
- Complexity level: Low
- Estimated architectural components: ~7 frontend UI components, 1 API resource (todos), 1 data model

### Technical Constraints & Dependencies

- SPA architecture — no SSR, no SEO requirements
- REST API with JSON request/response
- No authentication in MVP — API is open, but endpoint structure must support adding auth later without rewrite
- No offline support — requires active network connection
- No real-time features — standard request/response only
- Modern browsers only (latest 2 versions of Chrome, Firefox, Safari, Edge)
- Tailwind CSS as the styling framework (per UX specification decision)
- Mobile-first responsive design with two breakpoints (mobile default, desktop at 768px)

### Cross-Cutting Concerns Identified

- **Error handling pattern:** All errors surface through a single toast notification channel. Optimistic UI updates revert on failure. Input text is cached and restored on create failure.
- **State management:** Frontend must manage loading, empty, populated, and error states cleanly, with optimistic mutations and rollback capability.
- **API contract consistency:** All endpoints must return consistent response shapes, proper HTTP status codes, and never expose internal details.
- **Accessibility:** Semantic HTML, keyboard navigation, screen reader support, and WCAG AA contrast across all components.
- **Responsive behavior:** Single-column layout adapts via padding/spacing only — no layout reflow needed.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (SPA + REST API) based on project requirements analysis.

### Technology Preferences

| Category | Choice |
|----------|--------|
| Language | TypeScript |
| Frontend | React + Vite |
| Backend | Fastify |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | Tailwind CSS v4 |
| Testing | Jest |
| Linting | ESLint + Prettier |
| Logging | Pino (built into Fastify) |
| Containerization | Docker |
| CI/CD | GitHub Actions |
| Deployment | AWS ECS Fargate |
| Project Structure | Monorepo (npm workspaces) |

### Starter Options Considered

**Option A: Turborepo monorepo starter** — Rejected. Adds unnecessary Turbo dependency, assumes Next.js, doesn't fit Fastify + Vite SPA architecture.

**Option B: Fastify CLI (`npm init fastify`) + create-vite** — Rejected. Fastify CLI generates JavaScript by default with partial TypeScript support. Output requires significant rework to match our TypeScript-first, ESM monorepo setup.

**Option C: Manual monorepo + create-vite scaffold** — Selected. Uses `npm create vite@latest` for frontend (react-ts template), manual Fastify TypeScript setup for backend, npm workspaces for monorepo structure.

### Selected Approach: Manual Monorepo + create-vite

**Rationale for Selection:**
- Full control over project structure — no fighting starter opinions
- `create-vite` provides a clean, minimal React + TypeScript scaffold with no bloat
- Fastify backend is simple enough that manual setup is cleaner than adapting CLI output
- npm workspaces provides native monorepo support without extra tooling
- No unused dependencies or configuration to remove

**Initialization Commands:**

```bash
# 1. Initialize monorepo root
mkdir todo-app-bmad && cd todo-app-bmad
npm init -y

# 2. Scaffold frontend with create-vite
npm create vite@latest packages/client -- --template react-ts

# 3. Create backend package
mkdir -p packages/server && cd packages/server
npm init -y
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript across frontend and backend
- ESM module system
- Node.js 20+ runtime (required by Vite 9.x)

**Frontend Build Tooling (via create-vite react-ts):**
- Vite 9.x dev server and build tool
- React 19.x with TypeScript
- SWC for fast compilation
- Hot Module Replacement (HMR) in development

**Styling Solution:**
- Tailwind CSS v4 via `@tailwindcss/vite` plugin (added post-scaffold)
- CSS-first configuration (v4 approach)
- Inter font from Google Fonts (per UX spec)

**Testing Framework:**
- Jest with `ts-jest` for TypeScript support (added post-scaffold)
- Separate test configs for frontend and backend

**Code Quality:**
- ESLint with TypeScript rules (added/configured post-scaffold)
- Prettier for formatting (added post-scaffold)

**Logging:**
- Pino logger (built into Fastify — zero-config)

**Containerization:**
- Docker with multi-stage builds (configured post-scaffold)
- Docker Compose for local development (PostgreSQL + app)

**Project Structure:**
- npm workspaces monorepo with `packages/client` and `packages/server`
- Shared TypeScript types possible via `packages/shared` if needed

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data validation strategy: Fastify JSON Schema
- API response format: Envelope pattern
- Frontend state management: React built-in (useState/useContext)
- Static hosting: S3 + CloudFront
- Backend hosting: ECS Fargate

**Important Decisions (Shape Architecture):**
- API documentation: @fastify/swagger auto-generated
- Auth-ready API structure via Fastify plugin encapsulation
- Security middleware: @fastify/cors + @fastify/helmet
- Environment config: .env local + AWS Secrets Manager production
- Docker Compose for local development

**Deferred Decisions (Post-MVP):**
- Rate limiting (no auth = no clear threat model)
- Monitoring/alerting beyond CloudWatch Logs
- Authentication method (JWT, sessions, OAuth — decided when Phase 2 begins)

### Data Architecture

**Database:** PostgreSQL
**ORM:** Prisma with declarative schema modeling
**Migration Strategy:** Prisma Migrate — `prisma migrate dev` for development, `prisma migrate deploy` for production deployments via CI/CD pipeline

**Data Validation:**
- **Server-side:** Fastify built-in JSON Schema validation on all route inputs. Schemas define expected request body, params, and query string shapes. Invalid requests rejected with 400 status before handler executes.
- **Client-side:** Minimal — empty input silent rejection per UX spec. No form validation library needed.

**Data Model (Single resource):**

```prisma
model Todo {
  id          String   @id @default(uuid())
  text        String
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Authentication & Security

**MVP:** No authentication. API is open.

**Auth-Ready Structure:** All todo routes registered under `/api` prefix using Fastify plugin encapsulation. When auth is added in Phase 2, a single `preHandler` hook at the `/api` plugin level validates tokens — zero changes to existing route handlers.

**Security Middleware (MVP):**
- `@fastify/cors` — configured for frontend origin
- `@fastify/helmet` — security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Fastify JSON Schema validation — input sanitization at route level
- No stack traces or internal details in error responses (Fastify default in production mode)

**Deferred:** Rate limiting, CSRF protection (no cookies/sessions in MVP)

### API & Communication Patterns

**API Style:** REST over HTTP/JSON

**Endpoints:**

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|-------------|----------|
| GET | `/api/todos` | List all todos | — | `{ data: Todo[] }` |
| POST | `/api/todos` | Create a todo | `{ text: string }` | `{ data: Todo }` |
| PATCH | `/api/todos/:id` | Update a todo | `{ completed: boolean }` | `{ data: Todo }` |
| DELETE | `/api/todos/:id` | Delete a todo | — | `{ data: { id: string } }` |

**Response Format:** Envelope pattern

```json
// Success
{ "data": { ... } }

// Error (Fastify default)
{ "statusCode": 400, "error": "Bad Request", "message": "body must have required property 'text'" }
```

**API Documentation:** `@fastify/swagger` with `@fastify/swagger-ui` — auto-generated from JSON Schema route definitions. Available at `/docs` in development.

**HTTP Client (Frontend):** Native `fetch` API wrapped in a thin service layer (`todoApi.ts`). No axios — `fetch` is built-in and sufficient for 4 endpoints.

### Frontend Architecture

**State Management:** React built-in `useState` and `useContext`. No external state library. A `useTodos` custom hook encapsulates all API calls, optimistic updates, and rollback logic.

**Component Structure:** Flat organization — 7 components, no nested folders:

```
src/
  components/
    AppShell.tsx
    TodoInput.tsx
    TodoItem.tsx
    TodoList.tsx
    Toast.tsx
    EmptyState.tsx
    LoadingIndicator.tsx
  hooks/
    useTodos.ts
    useToast.ts
  api/
    todoApi.ts
  App.tsx
  main.tsx
```

**Routing:** None. Single page, single view. No React Router.

**Build Optimization:** Vite handles tree-shaking, code splitting, and minification. Tailwind CSS v4 purges unused styles automatically. Target bundle < 200KB gzipped (NFR5).

### Infrastructure & Deployment

**Frontend Hosting:** AWS S3 + CloudFront
- Vite builds static assets → uploaded to S3 bucket
- CloudFront CDN distribution serves static files globally
- S3 bucket policy restricts direct access (CloudFront OAI/OAC only)

**Backend Hosting:** AWS ECS Fargate
- Dockerized Fastify app deployed as ECS service
- Application Load Balancer (ALB) routes `/api/*` to ECS tasks
- Auto-scaling configured on CPU/memory thresholds
- ECR (Elastic Container Registry) stores Docker images

**Database Hosting:** AWS RDS PostgreSQL
- Managed PostgreSQL instance in private subnet
- Accessible only from ECS tasks within the same VPC

**Container Strategy:**
- Multi-stage Docker builds for both frontend (nginx static serving) and backend (slim Node.js production image)
- Non-root user in all production containers (security hardening)
- Health check instructions in all Dockerfiles (HEALTHCHECK directive)
- Docker Compose for local development: PostgreSQL container + backend container + frontend container
- Vite dev server runs natively (outside Docker) for fast HMR in development

**Environment Configuration:**
- Local: `.env` files (`.env.example` committed, `.env` gitignored)
- Production: AWS Secrets Manager for database credentials, ECS task definition environment variables for non-sensitive config

**CI/CD:** GitHub Actions
- On push to `main`: lint → test → build → deploy
- Docker image built and pushed to ECR
- ECS service updated with new task definition
- Frontend built and synced to S3, CloudFront cache invalidated

**Monitoring & Logging:**
- Pino structured JSON logs → stdout → ECS → CloudWatch Logs
- ECS health checks on `/health` endpoint
- Deferred: CloudWatch Alarms, X-Ray tracing, custom dashboards

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffold (monorepo, Vite frontend, Fastify backend)
2. Database setup (Prisma schema, Docker Compose PostgreSQL)
3. API routes with JSON Schema validation
4. Frontend components with API integration
5. Docker production build
6. AWS infrastructure (ECS, RDS, S3, CloudFront)
7. CI/CD pipeline (GitHub Actions)

**Cross-Component Dependencies:**
- Prisma schema defines the data shape → JSON Schema validation mirrors it → API response envelope wraps it → Frontend `todoApi.ts` types match it
- Fastify plugin encapsulation pattern affects how routes, hooks, and future auth are organized
- Docker Compose setup must align with production ECS configuration (same env vars, same ports)
- S3 + CloudFront deployment requires CORS configuration on the Fastify API to accept the CloudFront domain

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 5 categories where AI agents could make different choices — naming, structure, formats, error handling, and state management. All resolved below.

### Naming Patterns

**Database Naming (Prisma):**
- Model names: PascalCase singular — `Todo`
- Fields: camelCase — `createdAt`, `completed`
- Follow Prisma defaults for generated table/column names

**API Naming:**
- Endpoints: plural nouns — `/api/todos`
- Route params: `:id` format (Fastify default)
- Query params (future): camelCase — `?completedOnly=true`
- JSON fields in request/response: camelCase — `{ createdAt, completed }`

**Code Naming:**

| Element | Convention | Example |
|---------|-----------|--------|
| React components | PascalCase file + export | `TodoItem.tsx` → `TodoItem` |
| Hooks | camelCase with `use` prefix | `useTodos.ts` → `useTodos` |
| Utility files | camelCase | `todoApi.ts` |
| Functions/variables | camelCase | `getTodos`, `isLoading` |
| Types/interfaces | PascalCase | `Todo`, `CreateTodoRequest` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| CSS | Tailwind utilities only | No custom class names |

### Structure Patterns

**Test Location:** Co-located — test files live next to their source files.
- `TodoItem.tsx` → `TodoItem.test.tsx` (same directory)
- `todoService.ts` → `todoService.test.ts` (same directory)

**Frontend Organization:**
```
packages/client/src/
  components/
    AppShell.tsx
    AppShell.test.tsx
    TodoInput.tsx
    TodoInput.test.tsx
    TodoItem.tsx
    TodoItem.test.tsx
    TodoList.tsx
    TodoList.test.tsx
    Toast.tsx
    Toast.test.tsx
    EmptyState.tsx
    EmptyState.test.tsx
    LoadingIndicator.tsx
    LoadingIndicator.test.tsx
  hooks/
    useTodos.ts
    useTodos.test.ts
    useToast.ts
    useToast.test.ts
  api/
    todoApi.ts
    todoApi.test.ts
  App.tsx
  main.tsx
```

**Backend Organization:**
```
packages/server/src/
  routes/
    todos.ts
    todos.test.ts
  services/
    todoService.ts
    todoService.test.ts
  plugins/
    cors.ts
    helmet.ts
    swagger.ts
  app.ts
  app.test.ts
  server.ts
```

**Routes → Services → Prisma layering:** Route handlers are thin — they validate input (via JSON Schema), call service functions, and return responses. Services contain Prisma calls and business logic. This keeps routes testable and separates concerns.

### Format Patterns

**API Response Format:**
```json
// Success (envelope)
{ "data": { "id": "uuid", "text": "Buy groceries", "completed": false, "createdAt": "2026-04-22T10:30:00.000Z", "updatedAt": "2026-04-22T10:30:00.000Z" } }

// Success (list)
{ "data": [{ ... }, { ... }] }

// Error (Fastify default)
{ "statusCode": 400, "error": "Bad Request", "message": "body must have required property 'text'" }
```

**Date Format:** ISO 8601 strings in all API responses (`2026-04-22T10:30:00.000Z`). Prisma `Date` objects serialize to ISO strings automatically via Fastify JSON serialization.

**Health Check:** `GET /health` returns `{ status: "ok" }` — no auth, no envelope wrapper.

### Process Patterns

**Error Handling (Backend):**
- **Route-level:** JSON Schema validation rejects bad input (400) before handler executes
- **Service-level:** Prisma errors caught and mapped to HTTP status codes (404 for not found, 500 for unexpected)
- **Global:** Fastify `setErrorHandler` catches unhandled errors, logs via Pino, returns generic 500 with no internal details
- **Never expose:** Stack traces, database errors, or internal system details in responses

**Error Handling (Frontend):**
- All API calls go through `todoApi.ts` — handles response parsing and throws on non-OK status
- `useTodos` hook catches errors, triggers toast via `useToast`, handles optimistic rollback
- No `try/catch` in components — error handling lives in hooks only
- Toast is the single error communication channel — no inline errors, no modals

**Loading State Pattern:**
- Single `isLoading` boolean in `useTodos` for initial data fetch
- No per-operation loading states (optimistic UI = no visible "saving" indicator)
- Loading indicator shown only during initial `GET /api/todos` fetch

**Optimistic Update Pattern:**
1. Apply state change immediately in the UI
2. Fire API request in background
3. On success: keep new state
4. On failure: revert to previous state + show toast
5. Special case for create: cache input text, clear field, restore text on failure

**Logging Pattern (Backend):**
- Use Fastify's built-in Pino logger: `request.log` in route handlers, `fastify.log` elsewhere
- Log levels: `error` for failures, `info` for request lifecycle, `debug` for development
- Never log sensitive data
- Structured JSON format (Pino default) — consumed by CloudWatch in production

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow camelCase for all JavaScript/TypeScript identifiers (no snake_case except UPPER_SNAKE_CASE constants)
- Place test files co-located with source files using `.test.ts`/`.test.tsx` suffix
- Use the routes → services → Prisma layering for all backend code
- Wrap all API responses in `{ data: ... }` envelope (except health check and errors)
- Handle all errors through the toast system on frontend — no inline error displays
- Use Fastify's built-in JSON Schema for input validation — no Zod, no Joi, no manual validation
- Use `fetch` for API calls — no axios, no other HTTP clients
- Use Tailwind utility classes — no custom CSS classes, no CSS modules, no styled-components

**Anti-Patterns to Avoid:**
- ❌ Business logic in route handlers (use services)
- ❌ Direct Prisma calls from routes (use services)
- ❌ `try/catch` in React components (handle in hooks)
- ❌ Success toasts ("Task added!") — only error toasts
- ❌ Confirmation dialogs for delete — single action, no confirmation
- ❌ Console.log for logging — use Pino logger
- ❌ Any CSS-in-JS or CSS modules — Tailwind utilities only

## Project Structure & Boundaries

### Complete Project Directory Structure

```
todo-app-bmad/
├── README.md
├── package.json                          # Root workspace config
├── .gitignore
├── .prettierrc
├── .eslintrc.json                        # Root ESLint config (shared rules)
├── tsconfig.base.json                    # Shared TypeScript config
├── docker-compose.yml                    # Local dev: PostgreSQL + backend
├── .env.example                          # Environment variable template
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Lint → test → build on PR
│       └── deploy.yml                    # Build → push ECR → deploy ECS + S3
├── packages/
│   ├── client/
│   │   ├── package.json
│   │   ├── tsconfig.json                 # Extends tsconfig.base.json
│   │   ├── vite.config.ts
│   │   ├── Dockerfile                    # Multi-stage production build (nginx)
│   │   ├── index.html
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   └── src/
│   │       ├── main.tsx                  # React entry point
│   │       ├── App.tsx                   # Root component
│   │       ├── App.css                   # Tailwind CSS v4 imports
│   │       ├── components/
│   │       │   ├── AppShell.tsx
│   │       │   ├── AppShell.test.tsx
│   │       │   ├── TodoInput.tsx
│   │       │   ├── TodoInput.test.tsx
│   │       │   ├── TodoItem.tsx
│   │       │   ├── TodoItem.test.tsx
│   │       │   ├── TodoList.tsx
│   │       │   ├── TodoList.test.tsx
│   │       │   ├── Toast.tsx
│   │       │   ├── Toast.test.tsx
│   │       │   ├── EmptyState.tsx
│   │       │   ├── EmptyState.test.tsx
│   │       │   ├── LoadingIndicator.tsx
│   │       │   └── LoadingIndicator.test.tsx
│   │       ├── hooks/
│   │       │   ├── useTodos.ts
│   │       │   ├── useTodos.test.ts
│   │       │   ├── useToast.ts
│   │       │   └── useToast.test.ts
│   │       ├── api/
│   │       │   ├── todoApi.ts
│   │       │   └── todoApi.test.ts
│   │       └── types/
│   │           └── todo.ts               # Shared frontend types (Todo, CreateTodoRequest)
│   └── server/
│       ├── package.json
│       ├── tsconfig.json                 # Extends tsconfig.base.json
│       ├── Dockerfile                    # Multi-stage production build
│       ├── jest.config.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/               # Generated by prisma migrate dev
│       └── src/
│           ├── server.ts                 # Entry point — starts Fastify
│           ├── app.ts                    # Fastify app factory (createApp)
│           ├── app.test.ts               # Integration tests for app
│           ├── routes/
│           │   ├── todos.ts              # Todo CRUD routes + JSON schemas
│           │   └── todos.test.ts
│           ├── services/
│           │   ├── todoService.ts        # Business logic + Prisma calls
│           │   └── todoService.test.ts
│           └── plugins/
│               ├── cors.ts               # @fastify/cors configuration
│               ├── helmet.ts             # @fastify/helmet configuration
│               ├── swagger.ts            # @fastify/swagger + swagger-ui config
│               └── prisma.ts             # Prisma client plugin (decorates fastify)
```

### Architectural Boundaries

**API Boundaries:**
- All API routes live under `/api` prefix — `packages/server/src/routes/`
- Health check endpoint `/health` is registered directly on the app (outside `/api` prefix)
- Swagger UI available at `/docs` in development only
- Frontend communicates with backend exclusively through `packages/client/src/api/todoApi.ts`

**Component Boundaries:**
- React components are presentation-focused — they receive data and callbacks via props
- `App.tsx` is the composition root — it wires `useTodos` and `useToast` hooks to components
- Components never call API directly — all data flows through hooks
- Toast component is rendered at the App level, controlled by `useToast` context

**Service Boundaries:**
- `routes/todos.ts` — HTTP layer: JSON Schema validation, request parsing, response formatting
- `services/todoService.ts` — business layer: Prisma queries, error mapping, data logic
- `plugins/prisma.ts` — data layer: Prisma client lifecycle (connect on startup, disconnect on close)
- Routes depend on services; services depend on Prisma client. Never skip layers.

**Data Boundaries:**
- Prisma is the sole interface to PostgreSQL — no raw SQL
- Prisma client is registered as a Fastify decorator via `plugins/prisma.ts`
- Database schema managed exclusively through `prisma/schema.prisma` + migrations
- Frontend types in `types/todo.ts` mirror the API response shape (not the database schema)

### Requirements to Structure Mapping

**FR1–FR3 (Task Creation):**
- `TodoInput.tsx` — UI input and form submission
- `useTodos.ts` — `addTodo()` with optimistic create + rollback
- `todoApi.ts` — `POST /api/todos`
- `routes/todos.ts` — POST route handler + JSON Schema
- `todoService.ts` — `createTodo()` Prisma call

**FR4–FR6 (Task Display):**
- `TodoList.tsx` — renders list container with state-dependent content
- `TodoItem.tsx` — renders individual todo with checkbox and delete
- `useTodos.ts` — `todos` state array, `isLoading` flag
- `todoApi.ts` — `GET /api/todos`
- `routes/todos.ts` — GET route handler
- `todoService.ts` — `getAllTodos()` Prisma call

**FR7–FR8 (Task Completion):**
- `TodoItem.tsx` — checkbox toggle + full-row click
- `useTodos.ts` — `toggleTodo()` with optimistic toggle + rollback
- `todoApi.ts` — `PATCH /api/todos/:id`
- `routes/todos.ts` — PATCH route handler + JSON Schema
- `todoService.ts` — `updateTodo()` Prisma call

**FR9–FR10 (Task Deletion):**
- `TodoItem.tsx` — delete button with stopPropagation
- `useTodos.ts` — `deleteTodo()` with optimistic removal + rollback
- `todoApi.ts` — `DELETE /api/todos/:id`
- `routes/todos.ts` — DELETE route handler
- `todoService.ts` — `deleteTodo()` Prisma call

**FR14–FR18 (Error Handling):**
- `Toast.tsx` — toast notification UI
- `useToast.ts` — toast state (show/hide/message)
- `useTodos.ts` — catches API errors, triggers toast, reverts state

**FR19–FR21 (Application States):**
- `LoadingIndicator.tsx` — shown during initial fetch
- `EmptyState.tsx` — shown when todo list is empty
- `TodoList.tsx` — conditionally renders Loading/Empty/Populated states

**Cross-Cutting Concerns:**
- Error handling: `useToast.ts` + `Toast.tsx` (frontend), `setErrorHandler` in `app.ts` (backend)
- Input validation: JSON Schemas in `routes/todos.ts` (backend), empty check in `TodoInput.tsx` (frontend)
- Security: `plugins/cors.ts` + `plugins/helmet.ts` registered in `app.ts`
- Logging: Pino via Fastify built-in — no separate logging config file needed

### Data Flow

```
User Action → Component → useTodos hook → todoApi.ts → HTTP fetch
                                                            ↓
                                                    Fastify Route (JSON Schema validation)
                                                            ↓
                                                    todoService.ts (business logic)
                                                            ↓
                                                    Prisma Client → PostgreSQL
                                                            ↓
                                                    Response: { data: Todo }
                                                            ↓
useTodos hook ← todoApi.ts ← HTTP response ←───────────────┘
     ↓
State update → Component re-render
```

### Development Workflow

**Local Development:**
1. `docker compose up -d` — starts PostgreSQL container
2. `npx prisma migrate dev` — runs migrations (from `packages/server/`)
3. `npm run dev -w packages/server` — starts Fastify with hot reload
4. `npm run dev -w packages/client` — starts Vite dev server with HMR
5. Frontend proxies `/api` requests to backend via Vite proxy config

**Build Process:**
- Frontend: `vite build` → static assets in `packages/client/dist/`
- Backend: `tsc` → compiled JS in `packages/server/dist/` → Docker image

**Deployment:**
- Frontend `dist/` → S3 bucket → CloudFront CDN
- Backend Docker image → ECR → ECS Fargate service behind ALB
- Database → RDS PostgreSQL in private subnet

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are compatible and well-tested together:
- React 19 + Vite 9 + TypeScript — standard SPA stack
- Fastify 5 + Prisma 7 + PostgreSQL — all support ESM + TypeScript
- Tailwind CSS v4 + `@tailwindcss/vite` — native Vite integration
- Jest works with both React (jsdom) and Fastify (node) environments
- Pino is built into Fastify — zero-config logging
- Docker + ECS Fargate + RDS PostgreSQL — standard AWS production stack

**Note:** The UX spec references Tailwind v3 patterns (`tailwind.config.js`, `@apply`). Our architecture specifies Tailwind v4 with CSS-first configuration. Utility class names are the same — implementation agents should use the v4 CSS import approach instead of `tailwind.config.js`.

**Pattern Consistency:**
- camelCase naming throughout (JS/TS, API JSON, Prisma fields) — no translation needed
- Routes → Services → Prisma layering is consistent with Fastify plugin architecture
- Optimistic UI pattern consistently defined across all CRUD operations
- Toast as single error channel is consistently specified in both UX spec and architecture

**Structure Alignment:**
- Monorepo cleanly separates frontend/backend
- Co-located tests match flat component structure
- Plugin pattern matches Fastify’s encapsulation model
- Docker setup aligns with ECS deployment

### Requirements Coverage Validation ✅

**Functional Requirements (FR1–FR24):** All 24 covered.

| FR Range | Coverage | Architecture Support |
|----------|----------|---------------------|
| FR1–FR3 (Creation) | ✅ | TodoInput → useTodos → todoApi → POST route → todoService |
| FR4–FR6 (Display) | ✅ | TodoList/TodoItem → useTodos → todoApi → GET route → todoService |
| FR7–FR8 (Completion) | ✅ | TodoItem row click → useTodos → todoApi → PATCH route → todoService |
| FR9–FR10 (Deletion) | ✅ | TodoItem delete → useTodos → todoApi → DELETE route → todoService |
| FR11–FR13 (Persistence) | ✅ | Prisma → PostgreSQL, data survives restarts/refreshes |
| FR14–FR18 (Error Handling) | ✅ | useToast + Toast component, optimistic rollback, no false persistence |
| FR19–FR21 (App States) | ✅ | LoadingIndicator, EmptyState, TodoInput always visible |
| FR22–FR24 (Responsive) | ✅ | Tailwind mobile-first, 44px touch targets, single-column layout |

**Non-Functional Requirements (NFR1–NFR17):** All 17 covered.

| NFR | Requirement | Architecture Support |
|-----|-------------|---------------------|
| NFR1 | CRUD < 300ms | Fastify high-performance; Prisma indexed queries; simple data model |
| NFR2 | FCP < 1s | Vite tree-shaking + Tailwind purge + CloudFront CDN |
| NFR3 | TTI < 1.5s | Small bundle, no heavy framework overhead |
| NFR4 | UI update < 100ms | Optimistic UI — state updates before API response |
| NFR5 | Bundle < 200KB gzip | React + Vite + Tailwind CSS — well within budget |
| NFR6 | JSON validation | Fastify built-in JSON Schema validation |
| NFR7 | Input sanitization | JSON Schema rejects malformed input at route level |
| NFR8 | No stack traces | Fastify production mode + custom error handler |
| NFR9 | Auth-ready | `/api` plugin prefix + preHandler hook pattern |
| NFR10 | Durable persistence | PostgreSQL via RDS, Prisma transactions |
| NFR11 | HTTP status codes | Fastify default error handling + service error mapping |
| NFR12 | No unhandled exceptions | Global `setErrorHandler` + frontend error handling in hooks |
| NFR13 | No state corruption | Optimistic rollback pattern restores previous state on failure |
| NFR14 | Keyboard accessible | Semantic HTML, tab order, enter to submit (per UX spec) |
| NFR15 | Screen reader labels | aria-label on inputs, buttons, list (per UX spec) |
| NFR16 | Color contrast | WCAG AA ratios verified in UX spec |
| NFR17 | Focus indicators | Focus ring on all interactive elements (per UX spec) |

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical decisions documented with technology versions, rationale, and examples.

**Structure Completeness:** Every file and directory defined. Requirements mapped to specific files. No placeholders.

**Pattern Completeness:** Naming, structure, format, process, and enforcement patterns all specified with examples and anti-patterns.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps (non-blocking, addressable during implementation):**
1. **Vite proxy configuration** — agents should configure `vite.config.ts` to proxy `/api` requests to `http://localhost:3000` during development
2. **Jest configuration for frontend** — frontend tests need `@testing-library/react` + jsdom environment configuration

**Nice-to-Have Gaps (post-MVP):**
1. No infrastructure-as-code (Terraform/CDK) for AWS resources
2. No database seeding script

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Every functional and non-functional requirement has explicit architectural support
- Technology stack is well-tested and compatible — no experimental choices
- Clear layering (components → hooks → API → routes → services → Prisma) prevents ambiguity
- Anti-patterns list prevents common AI agent mistakes
- Optimistic UI pattern is fully specified with rollback for all operations

**Areas for Future Enhancement:**
- Infrastructure-as-code (Terraform/CDK) for reproducible AWS deployments
- E2E testing framework (Playwright/Cypress) — deferred post-MVP
- Rate limiting and CSRF when authentication is added
- Database connection pooling optimization at scale
