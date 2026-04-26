# Story 1.4: Display Todos — Full Stack

Status: done

## Story

As a user,
I want to see all my todos when I open the app,
So that I can review what I need to do.

## Acceptance Criteria

1. **Given** the user opens the application **When** the app loads **Then** a GET request is sent to `/api/todos`
2. **And** the API retrieves all todos via `todoService.getAllTodos()` and returns `{ data: Todo[] }`
3. **And** the todo list renders showing text and completion status for each item
4. **And** active todos display with dark text (#111827 / `text-near-black`)
5. **And** completed todos display with light gray text (#9CA3AF / `text-completed-gray`) and `line-through`
6. **And** a loading indicator (24px, centered, pulsing/spinner) is shown below the input while the GET request is in progress
7. **And** the input field remains accessible and usable during loading (not blocked)
8. **And** the loading indicator disappears when data loads successfully
9. **Given** no todos exist in the database **When** the app loads and receives an empty array **Then** the empty state is shown: ✨ emoji (40px) + "All caught up! Add a task to get started." (16px, #9CA3AF), centered with 48px vertical padding
10. **And** the input field remains visible and ready for use

## Tasks / Subtasks

- [x] Task 1: Add `getAllTodos` to todoService (AC: #2)
  - [x] Add `getAllTodos(prisma: PrismaClient): Promise<Todo[]>` to `packages/server/src/services/todoService.ts`
  - [x] Query `prisma.todo.findMany()` — return all todos ordered by `createdAt` ascending (oldest first)
  - [x] Import pattern: `import type { PrismaClient } from '../../generated/prisma/client.js'` (already used in file)
- [x] Task 2: Update GET route to use service (AC: #1, #2)
  - [x] Update `packages/server/src/routes/todos.ts` — replace stub `return { data: [] }` with actual service call
  - [x] Import `getAllTodos` from `../services/todoService.js`
  - [x] Route handler: `const todos = await getAllTodos(fastify.prisma)` → return `{ data: todos }`
  - [x] Add response schema for GET (optional, for Swagger):
    ```typescript
    const getAllTodosSchema = {
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
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
      },
    }
    ```
- [x] Task 3: Write backend tests for GET /api/todos (AC: #1, #2)
  - [x] Add `describe('GET /api/todos', ...)` block in `packages/server/src/app.test.ts`
  - [x] Test: GET returns 200 with `{ data: [] }` when no todos exist
  - [x] Test: GET returns all todos when multiple exist (create 2-3 via `app.prisma.todo.create()`)
  - [x] Test: Response includes all fields: id, text, completed, createdAt, updatedAt
  - [x] Test: Todos are ordered by createdAt ascending
  - [x] Verify existing POST tests still pass (no regressions)
- [x] Task 4: Add `fetchTodos` to todoApi (AC: #1)
  - [ ] Add to `packages/client/src/api/todoApi.ts`:
    ```typescript
    export async function fetchTodos(): Promise<Todo[]> {
      const response = await fetch(API_BASE)
      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.status}`)
      }
      const { data } = await response.json()
      return data
    }
    ```
  - [x] No request body, no headers needed for GET
- [x] Task 5: Update useTodos hook to fetch on mount (AC: #1, #6, #7, #8)
  - [x] Update `packages/client/src/hooks/useTodos.ts`
  - [x] Add `loading: boolean` state (initial: `true`)
  - [x] Add `useEffect` to call `fetchTodos()` on mount:
    ```typescript
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
      fetchTodos()
        .then((data) => setTodos(data))
        .catch((err) => console.error('Failed to fetch todos:', err))
        .finally(() => setLoading(false))
    }, [])
    ```
  - [x] Return `{ todos, addTodo, loading }` from hook
  - [x] Error handling beyond console.error is deferred to Story 3.1/3.2
- [x] Task 6: Create LoadingIndicator component (AC: #6, #8)
  - [x] Create `packages/client/src/components/LoadingIndicator.tsx`
  - [x] Render a subtle pulsing dots or small spinner animation
  - [x] 24px height, centered horizontally
  - [x] Wrap in `aria-live="polite"` region with sr-only text "Loading todos..."
  - [x] Styling: use Tailwind animate-pulse or a simple CSS keyframe spinner
  - [x] Example implementation:
    ```tsx
    export function LoadingIndicator() {
      return (
        <div className="flex justify-center py-4" aria-live="polite">
          <div className="flex space-x-1">
            <div className="h-2 w-2 rounded-full bg-medium-gray animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 rounded-full bg-medium-gray animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 rounded-full bg-medium-gray animate-bounce" />
          </div>
          <span className="sr-only">Loading todos...</span>
        </div>
      )
    }
    ```
- [x] Task 7: Create EmptyState component (AC: #9, #10)
  - [x] Create `packages/client/src/components/EmptyState.tsx`
  - [x] Render: ✨ emoji at 40px + text "All caught up! Add a task to get started." at 16px in #9CA3AF
  - [x] Centered within list area, 48px vertical padding (`py-12`)
  - [x] Implementation:
    ```tsx
    export function EmptyState() {
      return (
        <div className="flex flex-col items-center py-12">
          <span className="text-[40px]" role="img" aria-hidden="true">✨</span>
          <p className="mt-2 text-base text-completed-gray">All caught up! Add a task to get started.</p>
        </div>
      )
    }
    ```
  - [x] Note: Use `text-completed-gray` for `#9CA3AF` — verify this token exists in the Tailwind config. If not, use `text-[#9CA3AF]` as fallback.
- [x] Task 8: Update TodoItem for completion styling (AC: #3, #4, #5)
  - [x] Update `packages/client/src/components/TodoItem.tsx`
  - [x] Add conditional styling for completed state:
    - Active: `text-near-black` (already present)
    - Completed: `text-completed-gray line-through` (or `text-[#9CA3AF] line-through`)
  - [x] Keep minimal — no checkbox, no delete button, no click handler (those are Stories 2.1/2.2)
- [x] Task 9: Update TodoList to show LoadingIndicator or EmptyState (AC: #6, #8, #9)
  - [x] Update `packages/client/src/components/TodoList.tsx`
  - [x] Accept `loading: boolean` prop
  - [x] If `loading` → render `<LoadingIndicator />`
  - [x] If `!loading && todos.length === 0` → render `<EmptyState />`
  - [x] If `!loading && todos.length > 0` → render todo list as before
- [x] Task 10: Update App.tsx to pass loading state (AC: #6, #7)
  - [x] Update `packages/client/src/App.tsx`
  - [x] Destructure `loading` from `useTodos()`
  - [x] Pass `loading` prop to `<TodoList>`
  - [x] Ensure TodoInput remains rendered and usable regardless of loading state
- [x] Task 11: Write frontend tests (AC: #1, #3, #4, #5, #6, #8, #9)
  - [x] Update `packages/client/src/api/todoApi.test.ts` — add test for `fetchTodos`: calls GET, returns parsed data array, throws on error
  - [x] Update `packages/client/src/hooks/useTodos.test.ts` — test that `loading` starts true, becomes false after fetch, and `todos` populated
  - [x] Test TodoList renders LoadingIndicator when loading=true
  - [x] Test TodoList renders EmptyState when loading=false and todos=[]
  - [x] Test TodoList renders todos when loading=false and todos exist
  - [x] Test TodoItem renders completed styling (line-through, gray text) for completed todos
  - [x] Verify all existing tests still pass

## Dev Notes

### Architecture Compliance

- **Routes → Services → Prisma layering:** GET route calls `todoService.getAllTodos()`, not Prisma directly. Thin route handler.
- **Envelope response pattern:** Return `{ data: Todo[] }` — same envelope as POST.
- **Native fetch only:** Use `fetch` in `todoApi.ts`. No axios.
- **No try/catch in components:** Loading/error state managed in `useTodos` hook. Components receive state via props.
- **Co-located tests:** Test files next to source files.
- **ESM imports in server:** Use `.js` extensions (e.g., `../services/todoService.js`).

### Critical: Prisma v7 Import Pattern

```typescript
// CORRECT
import type { PrismaClient } from '../../generated/prisma/client.js'

// WRONG — do NOT use
// import { PrismaClient } from '@prisma/client'
```

### Existing Code to Modify (NOT Create)

These files already exist from Story 1.3 — **update, do not recreate**:

| File | Action |
|------|--------|
| `packages/server/src/services/todoService.ts` | Add `getAllTodos` function |
| `packages/server/src/routes/todos.ts` | Replace GET stub with service call |
| `packages/server/src/app.test.ts` | Add GET /api/todos test block |
| `packages/client/src/api/todoApi.ts` | Add `fetchTodos` function |
| `packages/client/src/hooks/useTodos.ts` | Add `useEffect` fetch, `loading` state |
| `packages/client/src/components/TodoItem.tsx` | Add completed styling |
| `packages/client/src/components/TodoList.tsx` | Add loading/empty state logic |
| `packages/client/src/App.tsx` | Pass `loading` to TodoList |
| `packages/client/src/api/todoApi.test.ts` | Add fetchTodos tests |
| `packages/client/src/hooks/useTodos.test.ts` | Add loading/fetch tests |

### New Files to Create

| File | Purpose |
|------|---------|
| `packages/client/src/components/LoadingIndicator.tsx` | Loading animation component |
| `packages/client/src/components/EmptyState.tsx` | Empty list state component |

### Current GET Route Stub

The GET route in `packages/server/src/routes/todos.ts` currently returns a hardcoded empty array:
```typescript
fastify.get('/', async () => {
  return { data: [] }
})
```
This MUST be replaced with the actual service call.

### Tailwind Design Tokens in Use

Verify these tokens exist in the project's Tailwind config (they were set up in Story 1.1):
- `text-near-black` → `#111827`
- `text-medium-gray` → `#6B7280`
- `text-completed-gray` → `#9CA3AF` (may need to verify — if missing, use `text-[#9CA3AF]`)
- `bg-warm-gray` → `#F9FAFB`
- `border-border-gray` → `#E5E7EB`

If `text-completed-gray` is not defined as a token, add it to the CSS or use the arbitrary value `text-[#9CA3AF]`.

### Testing Strategy

**Backend tests** (in `packages/server/src/app.test.ts`):
- Use existing test setup with `app.inject()` — no server startup needed
- The `beforeEach` already creates the Todo table and cleans data
- Seed test data using `app.prisma.todo.create()` directly

**Frontend tests**:
- Mock `fetch` globally for `todoApi.test.ts`
- Mock `todoApi` module for `useTodos.test.ts`
- Use `@testing-library/react` or `createRoot` for component tests (match existing pattern in `TodoInput.test.tsx`)

### Previous Story Intelligence

From Story 1.3:
- `createTodo` in the service layer trims whitespace server-side
- The POST route uses JSON Schema validation with `additionalProperties: false`
- Frontend `todoApi.ts` uses `API_BASE = '/api/todos'` constant — reuse for GET
- `useTodos` hook uses `useState<Todo[]>([])` — extend with `loading` state
- The Vite proxy for `/api` → `http://localhost:3001` is already configured
- Tests use `app.inject()` pattern for backend, mock `fetch` for frontend API tests

### Review Findings from Story 1.3

- Server-side whitespace rejection was added (pattern `.*\\S.*` in JSON Schema + trim in service)
- Tests enforce rejection contract for whitespace-only input
- These patterns are already in place — no action needed for this story

### Project Structure Notes

- All files align with the flat component structure defined in architecture
- `LoadingIndicator.tsx` and `EmptyState.tsx` are part of the 7 planned components in `src/components/`
- No new folders or structural changes needed

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Story 1.4 section]
- [Source: _bmad-output/planning-artifacts/architecture.md - API Endpoints table, Frontend Architecture section]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - UX-DR6 EmptyState, UX-DR7 LoadingIndicator]
- [Source: _bmad-output/planning-artifacts/prd.md - FR4, FR5, FR6, FR13, FR19, FR20, FR21]
- [Source: _bmad-output/implementation-artifacts/1-3-create-todo-full-stack.md - Previous story patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

- Used `.then`/`.catch` pattern instead of `.finally` in useTodos hook due to Jest tsconfig not including ES2018 lib for Promise.finally
- App.test.tsx updated to mock fetchTodos since useTodos now calls it on mount

### Completion Notes List

- **Backend:** Added `getAllTodos` service function with `createdAt` ascending ordering. Replaced GET route stub with actual service call and added Swagger response schema. Added 3 new backend tests (empty, multiple todos, field validation, ordering).
- **Frontend:** Added `fetchTodos` API function. Updated `useTodos` hook with `loading` state and `useEffect` fetch-on-mount. Created `LoadingIndicator` (animated bouncing dots with aria-live) and `EmptyState` (✨ emoji + message) components. Updated `TodoItem` with conditional completed styling (line-through + gray text). Updated `TodoList` to render loading/empty/list states. Updated `App.tsx` to pass loading prop.
- **Tests:** 16 server tests pass (3 new GET tests), 27 client tests pass (6 new fetchTodos tests, 4 new useTodos loading tests, 4 new TodoList tests, 2 new TodoItem tests). 0 regressions.
- **Lint:** 0 errors, 1 expected warning (console.error in useTodos — deferred to Story 3.1/3.2)

### File List

**Modified:**
- `packages/server/src/services/todoService.ts` — Added `getAllTodos` function
- `packages/server/src/routes/todos.ts` — Replaced GET stub with service call, added response schema
- `packages/server/src/app.test.ts` — Added GET /api/todos test block (3 tests)
- `packages/client/src/api/todoApi.ts` — Added `fetchTodos` function
- `packages/client/src/hooks/useTodos.ts` — Added loading state, useEffect fetch, fetchTodos import
- `packages/client/src/components/TodoItem.tsx` — Added conditional completed styling
- `packages/client/src/components/TodoList.tsx` — Added loading/empty state rendering
- `packages/client/src/App.tsx` — Destructure loading, pass to TodoList
- `packages/client/src/api/todoApi.test.ts` — Added fetchTodos tests, reorganized with describe blocks
- `packages/client/src/hooks/useTodos.test.ts` — Added loading/fetch tests, updated all tests to mock fetchTodos
- `packages/client/src/App.test.tsx` — Added fetchTodos mock

**Created:**
- `packages/client/src/components/LoadingIndicator.tsx` — Loading animation component
- `packages/client/src/components/EmptyState.tsx` — Empty list state component
- `packages/client/src/components/TodoList.test.tsx` — TodoList component tests
- `packages/client/src/components/TodoItem.test.tsx` — TodoItem component tests

### Review Findings

- [x] [Review][Defer] Error path renders the success empty state [packages/client/src/hooks/useTodos.ts:8] — deferred, will be covered as part of a later ticket.
- [x] [Review][Patch] Guard against stale fetch updates after unmount [packages/client/src/hooks/useTodos.ts:8]
- [x] [Review][Patch] Prevent the initial fetch from overwriting todos added before it resolves [packages/client/src/hooks/useTodos.ts:8]
- [x] [Review][Patch] Stabilize GET ordering beyond `createdAt` and align the ordering test with that contract [packages/server/src/services/todoService.ts:3]
- [x] [Review][Patch] Match the loading indicator's visual size to the 24px acceptance criteria [packages/client/src/components/LoadingIndicator.tsx:3]

## Change Log

- Implemented Story 1.4: Display Todos — Full Stack (Date: 2026-04-26)
  - Backend: getAllTodos service + GET route + 3 backend tests
  - Frontend: fetchTodos API, useTodos loading state, LoadingIndicator, EmptyState, TodoItem completion styling, TodoList state management
  - Tests: 43 total tests passing (16 server + 27 client), 0 regressions
