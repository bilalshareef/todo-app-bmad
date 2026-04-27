# Story 2.1: Complete Todo — Full Stack

Status: done

## Story

As a user,
I want to mark a todo as complete by clicking anywhere on the row,
So that I get a satisfying sense of progress as I finish tasks.

## Acceptance Criteria

1. **Given** the user has active todos in the list **When** the user clicks anywhere on a todo row (or taps on mobile) **Then** a PATCH request is sent to `/api/todos/:id` with `{ completed: true }`
2. **And** the API validates the request with JSON Schema (requires boolean `completed` field)
3. **And** the API updates the todo via `todoService.updateTodo()` and returns `{ data: Todo }`
4. **And** the checkbox fills with blue (#3B82F6) and shows a white checkmark with a 150ms CSS transition
5. **And** the todo text changes to #9CA3AF with `line-through` text decoration
6. **And** the circle checkbox is 20px diameter with #D1D5DB border when unchecked

7. **Given** the user has a completed todo **When** the user clicks the todo row again **Then** a PATCH request is sent with `{ completed: false }`
8. **And** the checkbox empties, text color restores to #111827, and strikethrough is removed (150ms transition)

9. **Given** the row is hovered on desktop **When** the mouse enters the todo row **Then** the row background shifts to #F9FAFB with `cursor: pointer` (150ms transition)

## Tasks / Subtasks

- [x] Task 1: Add `updateTodo` to backend service layer (AC: #2, #3)
  - [x] Add `updateTodo(prisma, id, data)` function to `packages/server/src/services/todoService.ts`
  - [x] Accept `id: string` and `data: { completed: boolean }`
  - [x] Use `prisma.todo.update({ where: { id }, data: { completed } })`
  - [x] Handle Prisma `P2025` (record not found) error — let it propagate for route handler to catch
- [x] Task 2: Add PATCH route to backend (AC: #1, #2, #3)
  - [x] Add PATCH `/:id` route to `packages/server/src/routes/todos.ts`
  - [x] Define JSON Schema for request: `params` with `id` (string, UUID format), `body` with `completed` (boolean, required)
  - [x] Define response schema for 200 with `{ data: Todo }` envelope
  - [x] Call `updateTodo(fastify.prisma, id, { completed })` from service
  - [x] Return `{ data: updatedTodo }` with 200 status
  - [x] Handle not-found: catch Prisma P2025, return 404 with `{ statusCode: 404, error: "Not Found", message: "Todo not found" }`
- [x] Task 3: Add backend tests for PATCH route (AC: #1, #2, #3)
  - [x] Add PATCH tests to `packages/server/src/app.test.ts`
  - [x] Test: PATCH `/api/todos/:id` with `{ completed: true }` returns 200 with updated todo
  - [x] Test: PATCH `/api/todos/:id` with `{ completed: false }` returns 200 with uncompleted todo
  - [x] Test: PATCH with missing `completed` field returns 400
  - [x] Test: PATCH with non-existent id returns 404
  - [x] Test: PATCH with invalid body type returns 400
- [x] Task 4: Add `updateTodo` to frontend API layer (AC: #1)
  - [x] Add `updateTodo(id, completed)` function to `packages/client/src/api/todoApi.ts`
  - [x] Send PATCH to `/api/todos/${id}` with body `{ completed }`
  - [x] Parse and return `data` from envelope response
  - [x] Throw on non-OK response (matching existing pattern)
- [x] Task 5: Add `toggleTodo` to `useTodos` hook (AC: #1, #7)
  - [x] Add `toggleTodo(id: string)` function to `packages/client/src/hooks/useTodos.ts`
  - [x] Find current todo in state, compute `!completed` value
  - [x] Call `updateTodo(id, !completed)` from `todoApi`
  - [x] On success: update the todo in state with the returned todo
  - [x] Return `toggleTodo` from the hook
- [x] Task 6: Update `TodoItem` component with checkbox and click handler (AC: #1, #4, #5, #6, #7, #8, #9)
  - [x] Update `packages/client/src/components/TodoItem.tsx` to accept `onToggle: (id: string) => void` prop
  - [x] Wrap content in a clickable `<li>` with `onClick={() => onToggle(todo.id)}`
  - [x] Add circle checkbox element (20px diameter, `#D1D5DB` border when unchecked)
  - [x] When completed: checkbox fills `#3B82F6` with white SVG checkmark
  - [x] Apply 150ms CSS transition on checkbox fill, text color, and hover background
  - [x] Text styling: `#111827` active, `#9CA3AF` + `line-through` when completed (already partially in place)
  - [x] Row hover: `#F9FAFB` background with `cursor: pointer`, scoped to `@media (hover: hover)`
  - [x] Row min-height: 48px, keep existing bottom border from TodoList `divide-y`
- [x] Task 7: Update `TodoList` to pass `onToggle` through (AC: #1)
  - [x] Update `TodoList` props interface to accept `onToggle: (id: string) => void`
  - [x] Pass `onToggle` to each `<TodoItem>` component
- [x] Task 8: Update `App.tsx` to wire `toggleTodo` (AC: #1)
  - [x] Destructure `toggleTodo` from `useTodos()` return value
  - [x] Pass `onToggle={toggleTodo}` to `<TodoList>`
- [x] Task 9: Add/update frontend tests (AC: #1, #4, #5, #6, #7, #8, #9)
  - [x] Update `packages/client/src/api/todoApi.test.ts` with `updateTodo` tests
  - [x] Update `packages/client/src/hooks/useTodos.test.ts` with `toggleTodo` tests
  - [x] Update `packages/client/src/components/TodoItem.test.tsx` — test checkbox renders, click calls onToggle, completed styling
  - [x] Update `packages/client/src/components/TodoList.test.tsx` — test onToggle prop forwarded
  - [x] Update `packages/client/src/App.test.tsx` if needed for new prop wiring
- [x] Task 10: Run full test suite and verify no regressions (AC: all)
  - [x] All existing tests pass (currently ~34+ tests)
  - [x] All new tests pass
  - [ ] Manual smoke test: click row toggles completion, re-click toggles back

### Review Findings

- [x] [Review][Patch] PATCH route does not validate todo IDs as UUIDs [packages/server/src/routes/todos.ts:60]
- [x] [Review][Patch] Toggle failures are unhandled in the hook [packages/client/src/hooks/useTodos.ts:52]
- [x] [Review][Patch] Repeated clicks can send conflicting toggle requests [packages/client/src/hooks/useTodos.ts:49]
- [x] [Review][Patch] Clickable todo rows are not keyboard-accessible [packages/client/src/components/TodoItem.tsx:10]
- [x] [Review][Patch] Todo text state changes do not animate over 150ms [packages/client/src/components/TodoItem.tsx:22]

## Dev Notes

### Architecture Compliance

- **Routes → Services → Prisma layering:** PATCH route handler is thin — validates via JSON Schema, calls `todoService.updateTodo()`, returns envelope response. Business logic stays in service.
- **JSON Schema validation:** Fastify built-in schema validates request body (`completed` boolean required) and params (`id` string) — no Zod, no Joi.
- **Envelope response:** Return `{ data: Todo }` for success. Error responses use Fastify default format.
- **todoApi.ts as single API layer:** All fetch calls go through this module. Components/hooks never call fetch directly.
- **Error handling in hooks only:** `useTodos.toggleTodo` handles errors. No try/catch in components.
- **Tailwind utilities only:** No custom CSS classes, no CSS modules.
- **Co-located tests:** Test files next to source files.

### Critical: Existing TodoItem Must Be Updated, Not Rebuilt

**Current TodoItem.tsx:**
```tsx
import type { Todo } from '../types/todo'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <li className={`py-3 px-4 font-sans ${todo.completed ? 'text-completed-gray line-through' : 'text-near-black'}`}>
      {todo.text}
    </li>
  )
}
```

**Target TodoItem.tsx structure:**
```tsx
interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
}

export function TodoItem({ todo, onToggle }: TodoItemProps) {
  return (
    <li
      onClick={() => onToggle(todo.id)}
      className="flex items-center gap-3 py-3 px-4 font-sans cursor-pointer transition-colors duration-150 hover:bg-warm-gray"
    >
      {/* Circle checkbox */}
      <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150
        ${todo.completed ? 'bg-accent-blue border-accent-blue' : 'border-[#D1D5DB]'}`}>
        {todo.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {/* Todo text */}
      <span className={`${todo.completed ? 'text-completed-gray line-through' : 'text-near-black'}`}>
        {todo.text}
      </span>
    </li>
  )
}
```

**Key changes from current implementation:**
- Add `onToggle` prop
- Add `onClick` on `<li>` to trigger toggle
- Add flex layout with checkbox + text
- Add circle checkbox (20px = `w-5 h-5`) with conditional fill
- Add 150ms transition (`transition-colors duration-150`)
- Add hover background (`hover:bg-warm-gray`)
- Hover must be scoped: use `@media (hover: hover)` via Tailwind — **Important:** wrap hover in `@media (hover: hover)` to prevent sticky hover on touch. Tailwind approach: add a utility or use `[@media(hover:hover)]:hover:bg-warm-gray` arbitrary variant syntax
- Keep existing text styling (completed-gray + line-through)

### Hover Scoping for Touch Devices (UX-DR9)

Per the UX design spec, hover states must be scoped to `@media (hover: hover)` to prevent sticky hover on touch devices. In Tailwind CSS v4, use the arbitrary variant syntax:

```
[@media(hover:hover)]:hover:bg-warm-gray
```

This ensures the row hover highlight only activates on devices with a hover-capable pointer (desktop mouse), not on touch devices.

### Backend PATCH Route — JSON Schema

```typescript
const updateTodoSchema = {
  params: {
    type: 'object' as const,
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object' as const,
    required: ['completed'],
    properties: {
      completed: { type: 'boolean' },
    },
    additionalProperties: false,
  },
  response: {
    200: {
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

### Backend updateTodo Service

```typescript
export async function updateTodo(prisma: PrismaClient, id: string, data: { completed: boolean }) {
  return prisma.todo.update({ where: { id }, data: { completed: data.completed } })
}
```

Handle Prisma `P2025` (record not found) in the route handler:
```typescript
import { Prisma } from '../../generated/prisma/client.js'

// In route handler:
try {
  const todo = await updateTodo(fastify.prisma, id, { completed })
  return { data: todo }
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Todo not found' })
  }
  throw error
}
```

**Important:** Check the actual Prisma error import path. The project uses `../../generated/prisma/client.js` — verify `PrismaClientKnownRequestError` is exported from there. If not, import from `@prisma/client` or check `../../generated/prisma/internal/prismaNamespace.js`.

### Frontend API — updateTodo

```typescript
export async function updateTodo(id: string, completed: boolean): Promise<Todo> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update todo: ${response.status}`)
  }
  const { data } = await response.json()
  return data
}
```

### Frontend Hook — toggleTodo

```typescript
async function toggleTodo(id: string): Promise<void> {
  const todo = todos.find((t) => t.id === id)
  if (!todo) return
  const updatedTodo = await apiUpdateTodo(id, !todo.completed)
  setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)))
}
```

**Note:** No optimistic update in this story. Per Epic 2 description, optimistic UI with rollback is mentioned, but Story 3.2 (Optimistic UI with Rollback & Error Recovery) explicitly handles the optimistic pattern including rollback for toggle failures. This story implements the basic toggle flow. When Story 3.2 is implemented, it will add: (1) optimistic state change before API call, (2) revert on failure, (3) toast notification.

### Existing Prop Chain — What Changes

| Component | Current Props | New Props |
|-----------|--------------|-----------|
| `App.tsx` | `useTodos()` returns `{ todos, addTodo, loading }` | Returns `{ todos, addTodo, loading, toggleTodo }` |
| `TodoList` | `{ todos: Todo[], loading: boolean }` | `{ todos: Todo[], loading: boolean, onToggle: (id: string) => void }` |
| `TodoItem` | `{ todo: Todo }` | `{ todo: Todo, onToggle: (id: string) => void }` |

### Tailwind Design Tokens Already Available

From `packages/client/src/App.css` `@theme` block:
- `text-near-black` → `#111827` ✓
- `text-completed-gray` → `#9CA3AF` ✓
- `bg-warm-gray` → `#F9FAFB` ✓ (used for row hover)
- `bg-accent-blue` → `#3B82F6` ✓ (checkbox fill)
- `border-accent-blue` → `#3B82F6` ✓ (checkbox border when checked)

**Not in theme:** `#D1D5DB` for unchecked checkbox border — use arbitrary value `border-[#D1D5DB]`

### Checkbox Dimensions

UX spec: 20px diameter circle checkbox = `w-5 h-5` in Tailwind (1.25rem = 20px). Use `rounded-full` for circle shape.

### Files to Modify (NOT Create)

| File | Action |
|------|--------|
| `packages/server/src/services/todoService.ts` | Add `updateTodo` function |
| `packages/server/src/routes/todos.ts` | Add PATCH `/:id` route with JSON Schema |
| `packages/server/src/app.test.ts` | Add PATCH endpoint tests |
| `packages/client/src/api/todoApi.ts` | Add `updateTodo` function |
| `packages/client/src/api/todoApi.test.ts` | Add `updateTodo` tests |
| `packages/client/src/hooks/useTodos.ts` | Add `toggleTodo`, return it, import `updateTodo` |
| `packages/client/src/hooks/useTodos.test.ts` | Add `toggleTodo` tests |
| `packages/client/src/components/TodoItem.tsx` | Add checkbox, click handler, hover, transitions |
| `packages/client/src/components/TodoItem.test.tsx` | Add checkbox rendering, click, styling tests |
| `packages/client/src/components/TodoList.tsx` | Accept and pass `onToggle` prop |
| `packages/client/src/components/TodoList.test.tsx` | Test `onToggle` forwarding |
| `packages/client/src/App.tsx` | Wire `toggleTodo` to `TodoList` |

### New Files to Create

None. All changes are to existing files.

### Files That Should NOT Be Modified

| File | Reason |
|------|--------|
| `packages/client/src/components/AppShell.tsx` | Layout component — no changes needed |
| `packages/client/src/components/TodoInput.tsx` | Input component — unchanged for this story |
| `packages/client/src/components/EmptyState.tsx` | Empty state — unchanged |
| `packages/client/src/components/LoadingIndicator.tsx` | Loading — unchanged |
| `packages/client/src/types/todo.ts` | `Todo` type already has `completed` field |
| `packages/server/prisma/schema.prisma` | Schema already has `completed` field |
| `packages/client/src/App.css` | Theme tokens already sufficient |

### Testing Strategy

**Backend tests** (in `app.test.ts`):
- Follow existing test patterns: use `createApp()`, inject requests
- Create a todo first, then PATCH it to test completion toggle
- Test both `completed: true` and `completed: false`
- Test 400 for invalid body (missing field, wrong type)
- Test 404 for non-existent UUID

**Frontend API tests** (in `todoApi.test.ts`):
- Mock `fetch` globally (matching existing pattern)
- Test `updateTodo` calls PATCH with correct URL and body
- Test error throwing on non-OK response

**Frontend hook tests** (in `useTodos.test.ts`):
- Mock `todoApi` module (matching existing pattern)
- Test `toggleTodo` flips completed state and calls API
- Test state updates after successful toggle

**Frontend component tests** (in `TodoItem.test.tsx`):
- Test checkbox renders (circle element present)
- Test unchecked state: empty circle with `#D1D5DB` border
- Test checked state: filled blue circle with checkmark
- Test click on row calls `onToggle` with todo id
- Test completed text has line-through and gray color

### Previous Story Intelligence

From Story 1.5 (most recent completed story):
- Tests use `createRoot` + `act` pattern for component rendering
- `fetchTodos` is mocked in `App.test.tsx` via `jest.mock('./api/todoApi')`
- `todoApi` module mock must be present in any test that renders components using `useTodos`
- Tailwind tokens `text-completed-gray` and `text-near-black` are confirmed working
- All frontend tests mock fetch at module level, not with global fetch mocking

From Story 1.4 (display todos):
- `TodoList` and `TodoItem` were created with basic display functionality
- `useTodos` hook established the pattern of returning state + action functions
- API layer uses `{ data }` destructuring from response envelope

### Git Intelligence

Recent commit pattern: `feat: story X.Y description` for implementations, `feat: add story X.Y` for story file creation. All work on `main` branch. Latest commit: `08d3e5d feat: story 1.5 app shell and layout`.

### Project Structure Notes

- All modifications align with the flat `src/components/` directory structure
- No new directories or files needed — purely extending existing modules
- The PATCH endpoint extends the existing `/api/todos` route plugin (same file)
- `updateTodo` service follows the same pattern as existing `createTodo` and `getAllTodos`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — API Endpoints, Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR4, UX-DR9, UX-DR13]
- [Source: _bmad-output/planning-artifacts/prd.md — FR7, FR8]
- [Source: _bmad-output/implementation-artifacts/1-5-app-shell-and-layout.md — Previous Story Intelligence]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

- Prisma `import.meta.url` issue: Generated Prisma client uses `import.meta.url` which breaks Jest without `NODE_OPTIONS='--experimental-vm-modules'`. Server `package.json` already has this flag in the test script. Avoided importing `Prisma` namespace directly in routes; used duck-typing (`error.code === 'P2025'`) for error detection instead.

### Completion Notes List

- Backend: Added `updateTodo` service function and PATCH `/:id` route with JSON Schema validation and P2025 error handling
- Frontend API: Added `updateTodo(id, completed)` function following existing fetch pattern
- Hook: Added `toggleTodo(id)` that flips completed state and calls API, returns updated todo
- TodoItem: Redesigned with circle checkbox (20px, blue fill when completed, white checkmark SVG), click handler on full row, 150ms transitions, hover scoped to `@media(hover:hover)`
- TodoList: Added `onToggle` prop passthrough to TodoItem
- App: Wired `toggleTodo` from hook through to TodoList
- Tests: 67 total (21 backend + 46 frontend), all passing, 0 regressions
- Linting: 0 errors, 1 pre-existing warning (console.error in useTodos catch)

### File List

- `packages/server/src/services/todoService.ts` — Added `updateTodo` function
- `packages/server/src/routes/todos.ts` — Added PATCH `/:id` route with JSON Schema, P2025 error handling
- `packages/server/src/app.test.ts` — Added 5 PATCH endpoint tests
- `packages/client/src/api/todoApi.ts` — Added `updateTodo` function
- `packages/client/src/api/todoApi.test.ts` — Added 3 `updateTodo` tests
- `packages/client/src/hooks/useTodos.ts` — Added `toggleTodo`, imported `updateTodo`
- `packages/client/src/hooks/useTodos.test.ts` — Added 3 `toggleTodo` tests
- `packages/client/src/components/TodoItem.tsx` — Added checkbox, click handler, transitions, hover
- `packages/client/src/components/TodoItem.test.tsx` — Added 4 new tests (checkbox, click, styling)
- `packages/client/src/components/TodoList.tsx` — Added `onToggle` prop, passed to TodoItem
- `packages/client/src/components/TodoList.test.tsx` — Updated all tests with `onToggle`, added forwarding test
- `packages/client/src/App.tsx` — Wired `toggleTodo` to TodoList
