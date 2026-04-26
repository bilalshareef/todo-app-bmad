# Story 1.3: Create Todo — Full Stack

Status: ready-for-dev

## Story

As a user,
I want to type a task and press enter to add it to my list,
So that I can capture what I need to do instantly.

## Acceptance Criteria

1. **Given** the app is loaded in the browser **When** the user types text into the input field and presses Enter **Then** a POST request is sent to `/api/todos` with `{ text: "user's text" }`
2. **And** the API validates the request body with JSON Schema (requires non-empty `text` string)
3. **And** the API creates a Todo record via `todoService.createTodo()` and returns `{ data: Todo }` with 201 status
4. **And** the new todo appears in the list immediately after successful API response
5. **And** the input field clears after submission
6. **And** the creation timestamp is stored as metadata (createdAt)
7. **Given** the user submits an empty input **When** Enter is pressed with no text (or whitespace only) **Then** nothing happens — silent rejection, no API call, no error message
8. **Given** the API receives a malformed or empty request body **When** JSON Schema validation fails **Then** the API returns 400 with Fastify's default error format and no internal details

## Tasks / Subtasks

- [ ] Task 1: Create todoService with createTodo (AC: #3, #6)
  - [ ] Create `packages/server/src/services/todoService.ts`
  - [ ] Implement `createTodo(prisma: PrismaClient, text: string)` — trim the text, then call `prisma.todo.create({ data: { text: trimmedText } })`
  - [ ] Trim whitespace server-side before persisting (defense-in-depth — frontend also trims)
  - [ ] Return the full Todo record (includes auto-generated id, createdAt, updatedAt, default completed=false)
- [ ] Task 2: Add POST route with JSON Schema validation (AC: #1, #2, #3, #8)
  - [ ] Update `packages/server/src/routes/todos.ts` — add POST `/` route
  - [ ] Define JSON Schema for request body: `{ type: 'object', required: ['text'], properties: { text: { type: 'string', minLength: 1 } } }`
  - [ ] Define JSON Schema for 201 response (optional but recommended for Swagger)
  - [ ] Route handler: extract `text` from body, call `todoService.createTodo(fastify.prisma, text)`, return `{ data: todo }` with 201
  - [ ] Verify Fastify JSON Schema validation rejects empty/missing `text` with 400
- [ ] Task 3: Write backend tests (AC: #1, #2, #3, #6, #8)
  - [ ] Add tests to `packages/server/src/app.test.ts` in a new describe block for POST /api/todos
  - [ ] Test: POST with valid body `{ text: "Buy groceries" }` returns 201 + `{ data: { id, text, completed: false, createdAt, updatedAt } }`
  - [ ] Test: POST with empty body `{}` returns 400 with Fastify validation error format
  - [ ] Test: POST with `{ text: "" }` returns 400 (minLength: 1 validation)
  - [ ] Test: POST with `{ text: "   " }` — decide whether to trim server-side (recommended: trim + reject if empty after trim)
  - [ ] Test: Verify createdAt and updatedAt are ISO date strings in response
  - [ ] Test: Verify all existing tests still pass (no regressions)
- [ ] Task 4: Create frontend Todo type (AC: #4)
  - [ ] Create `packages/client/src/types/todo.ts`
  - [ ] Define `Todo` interface: `{ id: string, text: string, completed: boolean, createdAt: string, updatedAt: string }`
  - [ ] Define `CreateTodoRequest` interface: `{ text: string }`
- [ ] Task 5: Create todoApi service layer (AC: #1)
  - [ ] Create `packages/client/src/api/todoApi.ts`
  - [ ] Implement `createTodo(text: string): Promise<Todo>` — POST to `/api/todos` with `{ text }`, parse `{ data: Todo }` envelope, return the Todo
  - [ ] Use native `fetch` — no axios
  - [ ] Throw on non-OK response (throw an Error with the response status/message)
  - [ ] Set `Content-Type: application/json` header
- [ ] Task 6: Create useTodos hook (AC: #4, #5)
  - [ ] Create `packages/client/src/hooks/useTodos.ts`
  - [ ] State: `todos: Todo[]` (starts empty — fetching on load is Story 1.4)
  - [ ] Implement `addTodo(text: string): Promise<void>`:
    - Call `todoApi.createTodo(text)`
    - On success: append returned Todo to `todos` state
    - On failure: re-throw error (error handling/toast is Story 3.1)
  - [ ] Return `{ todos, addTodo }`
- [ ] Task 7: Create TodoInput component (AC: #1, #5, #7)
  - [ ] Create `packages/client/src/components/TodoInput.tsx`
  - [ ] Render a controlled `<input>` with:
    - Placeholder: "What needs to be done?"
    - `aria-label="Add a new task"`
    - `autoFocus` on mount
    - `onKeyDown` handler: if Enter + non-empty trimmed text → call `onSubmit(text)` prop + clear input
    - If Enter + empty/whitespace → do nothing (silent rejection)
  - [ ] Styling (per UX spec): `h-12 w-full rounded-lg bg-warm-gray border border-border-gray focus:ring-2 focus:ring-accent-blue focus:outline-none px-4 text-near-black placeholder:text-medium-gray font-sans`
- [ ] Task 8: Create minimal TodoList and TodoItem (AC: #4)
  - [ ] Create `packages/client/src/components/TodoList.tsx` — renders `<ul>` with todos.map → TodoItem. Minimal version for Story 1.3; enhanced in Stories 1.4/1.5.
  - [ ] Create `packages/client/src/components/TodoItem.tsx` — renders `<li>` with todo text. Basic text display; checkbox/delete/styling comes in Stories 2.1/2.2.
  - [ ] TodoList `aria-label="Todo list"` on `<ul>`
- [ ] Task 9: Wire components into App.tsx (AC: #4, #5)
  - [ ] Update `packages/client/src/App.tsx`
  - [ ] Import and use `useTodos` hook
  - [ ] Render `TodoInput` passing `addTodo` as `onSubmit` prop
  - [ ] Render `TodoList` passing `todos` array
  - [ ] Basic centered layout (will be replaced by AppShell in Story 1.5)
- [ ] Task 10: Write frontend tests (AC: #1, #4, #5, #7)
  - [ ] Create `packages/client/src/components/TodoInput.test.tsx` — test enter-to-submit, clear after submit, silent rejection of empty input, auto-focus
  - [ ] Create `packages/client/src/api/todoApi.test.ts` — test createTodo calls fetch correctly, handles success/error responses
  - [ ] Create `packages/client/src/hooks/useTodos.test.ts` — test addTodo appends to todos state
  - [ ] Verify existing App.test.tsx still passes

## Dev Notes

### Architecture Compliance

- **Routes → Services → Prisma layering:** Route handler is thin — validates input (JSON Schema), calls service, returns response. Business logic in `todoService.ts`, Prisma calls in service.
- **Envelope response pattern:** All success responses wrapped in `{ data: ... }`. Errors use Fastify default format.
- **Native fetch only:** No axios in the frontend. Use `fetch` in `todoApi.ts`.
- **No try/catch in components:** Error handling lives in hooks. For this story, errors propagate up — toast integration is Story 3.1.
- **Co-located tests:** Test files live next to source files (`.test.ts`/`.test.tsx`).
- **ESM throughout:** Use `.js` extensions in server-side imports. Frontend uses bundler resolution (no extensions needed).

### Critical: Prisma v7 Import Pattern

The project uses Prisma v7 with driver adapters. **Do NOT import from `@prisma/client`**. Import from the generated output path:

```typescript
// CORRECT — packages/server/src/services/todoService.ts
import { PrismaClient } from '../../generated/prisma/client.js'

// WRONG — do NOT use
// import { PrismaClient } from '@prisma/client'
```

The Prisma client is available on the Fastify instance as `fastify.prisma` (decorated via `plugins/prisma.ts`). In the service layer, receive it as a parameter:

```typescript
// todoService.ts
import type { PrismaClient } from '../../generated/prisma/client.js'

export async function createTodo(prisma: PrismaClient, text: string) {
  return prisma.todo.create({ data: { text } })
}
```

In the route handler:
```typescript
const todo = await createTodo(fastify.prisma, text)
```

### JSON Schema for POST /api/todos

```typescript
const createTodoSchema = {
  body: {
    type: 'object' as const,
    required: ['text'],
    properties: {
      text: { type: 'string', minLength: 1 }
    },
    additionalProperties: false,
  },
  response: {
    201: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            text: { type: 'string' },
            completed: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
      },
    },
  },
}
```

Fastify automatically returns 400 with its default error format when JSON Schema validation fails. The global error handler in `app.ts` already passes validation errors through via `return reply.send(error)`.

### Create Flow — NOT Optimistic

For create specifically, the architecture specifies a non-optimistic pattern with text caching:
1. Cache input text internally
2. Clear input field immediately (feels fast)
3. Fire POST request
4. **On success:** Add returned Todo to list, discard cached text
5. **On failure:** Restore cached text to input field + show toast

**For Story 1.3 scope:** Implement steps 1–4. The failure rollback (step 5) and toast notification are deferred to Stories 3.1/3.2. For now, just clear the input and append on success. Errors can be logged to console temporarily.

### TodoInput Component Spec

```
┌────────────────────────────────────────┐
│  What needs to be done?                │  ← 48px height, rounded-lg
└────────────────────────────────────────┘
```

- Height: 48px (`h-12`)
- Background: `#F9FAFB` (`bg-warm-gray`)
- Border: `#E5E7EB` (`border border-border-gray`)
- Focus: `ring-2 ring-accent-blue` blue focus ring
- Placeholder: "What needs to be done?" in `#6B7280` (`placeholder:text-medium-gray`)
- Text: `#111827` (`text-near-black`)
- Font: Inter (`font-sans`) at 16px (default)
- Padding: `px-4`
- Full width: `w-full`
- Auto-focus on mount
- `aria-label="Add a new task"`

### Minimal TodoList/TodoItem (Story 1.3 Version)

These are bare-minimum implementations to show created todos. They will be significantly enhanced:
- Story 1.4: Loading indicator, empty state, GET /api/todos fetch
- Story 1.5: AppShell layout, spacing, dividers
- Story 2.1: Checkbox, completion toggle, row click, hover states
- Story 2.2: Delete button

For now:
- `TodoList`: `<ul aria-label="Todo list">` → map todos → `<TodoItem>`
- `TodoItem`: `<li>` with todo text displayed. Use basic styling consistent with design tokens.

### Frontend API Layer Pattern

```typescript
// packages/client/src/api/todoApi.ts
const API_BASE = '/api/todos'

export async function createTodo(text: string): Promise<Todo> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create todo: ${response.status}`)
  }

  const { data } = await response.json()
  return data
}
```

Note: The Vite proxy (`/api` → `http://localhost:3001`) is already configured in `vite.config.ts`, so relative URLs work in development.

### Testing Strategy

**Backend tests** (in `packages/server/src/app.test.ts`):
- Use the existing test setup which creates a test schema and manages the app lifecycle
- Add a new `describe('POST /api/todos', ...)` block
- Use `app.inject()` for HTTP-level testing (no server startup needed)
- The beforeEach already creates the Todo table and cleans up data

**Frontend tests**:
- `TodoInput.test.tsx`: Use `createRoot` or `@testing-library/react` if available. Test:
  - Renders input with correct placeholder
  - Calls onSubmit with trimmed text on Enter key
  - Clears input after submission
  - Does not call onSubmit on Enter with empty/whitespace input
  - Has correct aria-label
- `todoApi.test.ts`: Mock `fetch` globally. Test:
  - Sends POST with correct URL, method, headers, body
  - Returns parsed Todo on success
  - Throws on non-OK response
- `useTodos.test.ts`: Mock `todoApi`. Test:
  - Initial todos array is empty
  - addTodo appends new todo to state

**Note:** The client package does NOT have `@testing-library/react` installed. Either:
- Install it: `npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event -w packages/client`
- Or use `createRoot` directly as in the existing `App.test.tsx` pattern

**Recommendation:** Install `@testing-library/react` — it's the standard for React component testing and will be essential for testing TodoInput's keyboard interactions. The existing `App.test.tsx` uses `createRoot` directly but that's just a placeholder.

### Previous Story Intelligence

**From Story 1.1:**
- ESM module system throughout — server imports use `.js` extensions
- Tailwind v4 uses CSS-first config with `@theme` in `App.css` — NOT `tailwind.config.js`
- Design tokens already defined: `--color-warm-gray`, `--color-near-black`, `--color-medium-gray`, `--color-border-gray`, `--color-accent-blue`, etc.
- Jest requires `NODE_OPTIONS='--experimental-vm-modules'` for server tests
- The client Jest config uses `jsdom` environment and has a CSS mock at `__mocks__/styleMock.js`

**From Story 1.2:**
- Prisma v7 with driver adapters — `PrismaPg` adapter pattern
- PrismaClient imported from `../../generated/prisma/client.js` (NOT `@prisma/client`)
- Test setup uses a separate schema `app_test` in the same database — creates the Todo table manually
- `process.loadEnvFile?.()` is used in `app.ts` for env loading (Node 22+ built-in)
- `server/package.json` has `predev`, `prebuild`, `pretest` scripts that run `prisma:generate`
- The global error handler passes validation errors through: `if (error.validation) { return reply.send(error) }`
- Swagger is conditionally registered in non-production environments

**From Story 1.2 Review Findings (all resolved):**
- Prisma connection uses fallback `?? 'postgresql://...'` instead of requiring DATABASE_URL
- Validation errors now pass through Fastify's default format correctly
- `prisma:generate` runs via npm `pre*` scripts on fresh checkouts

### Deferred Work (Not In Scope)

- No `.env` loading mechanism beyond `process.loadEnvFile?.()` — continue as-is
- PORT env var validation — not blocking
- Spacing rhythm tokens — not relevant yet
- Error toast notifications — Story 3.1
- Optimistic UI with rollback — Story 3.2
- Input text restore on failure — Story 3.2
- GET /api/todos (loading on app open) — Story 1.4
- Empty state / Loading indicator — Story 1.4
- AppShell layout — Story 1.5
- Completion toggle — Story 2.1
- Delete functionality — Story 2.2

### Project Structure Notes

**New files to create:**
```
packages/server/src/
  services/
    todoService.ts             # NEW — createTodo business logic
packages/client/src/
  types/
    todo.ts                    # NEW — Todo and CreateTodoRequest types
  api/
    todoApi.ts                 # NEW — fetch wrapper for POST /api/todos
    todoApi.test.ts            # NEW — tests for todoApi
  hooks/
    useTodos.ts                # NEW — todos state + addTodo
    useTodos.test.ts           # NEW — tests for useTodos
  components/
    TodoInput.tsx              # NEW — input with enter-to-submit
    TodoInput.test.tsx         # NEW — tests for TodoInput
    TodoList.tsx               # NEW — minimal list container
    TodoItem.tsx               # NEW — minimal todo item display
```

**Files to modify:**
```
packages/server/src/routes/todos.ts   # MODIFY — add POST route with JSON Schema
packages/server/src/app.test.ts       # MODIFY — add POST /api/todos tests
packages/client/src/App.tsx           # MODIFY — wire TodoInput + TodoList
packages/client/src/App.test.tsx      # MODIFY — update for new App structure
```

### Naming Conventions (Enforce)

| Element | Convention | Example |
|---------|-----------|--------|
| React components | PascalCase file + export | `TodoInput.tsx` → `TodoInput` |
| Hooks | camelCase with `use` prefix | `useTodos.ts` → `useTodos` |
| Utility files | camelCase | `todoApi.ts` |
| Service files | camelCase | `todoService.ts` |
| Functions/variables | camelCase | `createTodo`, `addTodo` |
| Types/interfaces | PascalCase | `Todo`, `CreateTodoRequest` |
| Constants | UPPER_SNAKE_CASE | `API_BASE` |
| CSS | Tailwind utilities only | No custom class names |

### Anti-Patterns to Avoid

- ❌ Do NOT import PrismaClient from `@prisma/client` — use generated path `../../generated/prisma/client.js`
- ❌ Do NOT install axios — use native `fetch`
- ❌ Do NOT put business logic (Prisma calls) in route handlers — use `todoService.ts`
- ❌ Do NOT add try/catch in React components — error handling lives in hooks
- ❌ Do NOT create `tailwind.config.js` — design tokens are in `App.css` with `@theme`
- ❌ Do NOT implement optimistic UI for create in this story — the todo should only appear after successful API response
- ❌ Do NOT implement toast notifications — that's Story 3.1
- ❌ Do NOT implement GET /api/todos fetch on mount — that's Story 1.4
- ❌ Do NOT implement checkbox, delete button, or completion toggle — those are Stories 2.1/2.2
- ❌ Do NOT implement AppShell component — that's Story 1.5
- ❌ Do NOT use console.log in server code — use Fastify Pino logger
- ❌ Do NOT create a separate test file for routes — add to existing `app.test.ts` which has the test database setup

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3] — acceptance criteria and user story
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — POST endpoint spec, envelope pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — component structure, hooks, api layer
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules] — naming, structure, error handling patterns
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries] — file organization, service boundaries
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — JSON Schema validation strategy
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#TodoInput] — input component visual spec
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Defining Interaction] — enter-to-submit, silent empty rejection
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual Design Foundation] — color palette, typography
- [Source: _bmad-output/implementation-artifacts/1-1-project-scaffold-and-monorepo-setup.md] — project foundation, Tailwind v4 approach
- [Source: _bmad-output/implementation-artifacts/1-2-database-setup-and-api-foundation.md] — Prisma v7 patterns, plugin architecture, test setup

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

### File List
