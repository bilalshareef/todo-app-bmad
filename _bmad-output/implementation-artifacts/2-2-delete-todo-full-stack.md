# Story 2.2: Delete Todo — Full Stack

Status: done

## Story

As a user,
I want to delete a todo with a single click on the delete button,
So that I can remove tasks I no longer need without any friction.

## Acceptance Criteria

1. **Given** the user has todos in the list **When** the user clicks the delete button (×) on a todo item **Then** a DELETE request is sent to `/api/todos/:id`
2. **And** the API deletes the todo via `todoService.deleteTodo()` and returns `{ data: { id: string } }`
3. **And** the todo is removed from the list instantly (no exit animation)
4. **And** the delete action does NOT trigger the row's completion toggle (`stopPropagation`)

5. **Given** the delete button is in its default state **When** the user views the todo row **Then** the × button is visible with a 32px hit area, color #D1D5DB, transparent background

6. **Given** the delete button is hovered on desktop **When** the mouse enters the × button **Then** the color changes to #EF4444 and background to #FEE2E2 (150ms transition)

7. **Given** the last todo is deleted **When** the list becomes empty **Then** the empty state is displayed (✨ "All caught up! Add a task to get started.")

## Tasks / Subtasks

- [x] Task 1: Add `deleteTodo` to backend service layer (AC: #2)
  - [x] Add `deleteTodo(prisma, id)` function to `packages/server/src/services/todoService.ts`
  - [x] Accept `id: string` parameter
  - [x] Use `prisma.todo.delete({ where: { id } })`
  - [x] Return the deleted todo (Prisma returns it by default)
  - [x] Prisma `P2025` (record not found) will throw — let route handler catch it
- [x] Task 2: Add DELETE route to backend (AC: #1, #2)
  - [x] Add DELETE `/:id` route to `packages/server/src/routes/todos.ts`
  - [x] Import `deleteTodo` from service
  - [x] Define JSON Schema for request: `params` with `id` (string, UUID format) — no body needed
  - [x] Define response schema for 200 with `{ data: { id: string } }` envelope
  - [x] Call `deleteTodo(fastify.prisma, id)` from service
  - [x] Return `{ data: { id: deletedTodo.id } }` with 200 status
  - [x] Handle not-found: catch Prisma P2025, return 404 with `{ statusCode: 404, error: "Not Found", message: "Todo not found" }`
  - [x] Reuse the same P2025 error pattern from the existing PATCH route
- [x] Task 3: Add backend tests for DELETE route (AC: #1, #2)
  - [x] Add DELETE tests to `packages/server/src/app.test.ts`
  - [x] Test: DELETE `/api/todos/:id` returns 200 with `{ data: { id } }`
  - [x] Test: deleted todo no longer appears in GET `/api/todos`
  - [x] Test: DELETE with non-existent UUID returns 404
  - [x] Test: DELETE with invalid (non-UUID) id returns 400
- [x] Task 4: Add `deleteTodo` to frontend API layer (AC: #1)
  - [x] Add `deleteTodo(id)` function to `packages/client/src/api/todoApi.ts`
  - [x] Send DELETE to `/api/todos/${id}` — no body needed
  - [x] Parse and return `data` from envelope response
  - [x] Throw on non-OK response (matching existing pattern)
- [x] Task 5: Add `deleteTodo` to `useTodos` hook (AC: #1, #3)
  - [x] Add `deleteTodo(id: string)` function to `packages/client/src/hooks/useTodos.ts`
  - [x] Call `apiDeleteTodo(id)` from `todoApi`
  - [x] On success: remove the todo from state via `setTodos((prev) => prev.filter((t) => t.id !== id))`
  - [x] Return `deleteTodo` from the hook
- [x] Task 6: Update `TodoItem` component with delete button (AC: #3, #4, #5, #6)
  - [x] Add `onDelete: (id: string) => void` prop to `TodoItemProps`
  - [x] Add × button inside the `<li>` — positioned after the text span, right-aligned
  - [x] × button must call `e.stopPropagation()` then `onDelete(todo.id)` — prevent toggle
  - [x] **Important:** The × button is a nested `<button>` inside the existing toggle `<button>`. To avoid button nesting (invalid HTML), restructure the `<li>` so the toggle area and delete button are siblings, not nested. Use a `<div>` wrapper with `onClick` for the toggle zone, and a separate `<button>` for delete.
  - [x] Styling: 32px hit area (`w-8 h-8`), flex centered, `text-[#D1D5DB]` default, transparent background
  - [x] Hover styling: `text-error-red` (`#EF4444`), `bg-[#FEE2E2]` — scoped with `[@media(hover:hover)]:hover:` prefix
  - [x] 150ms transition on color and background (`transition-colors duration-150`)
  - [x] Rounded corners on hover background (`rounded`)
  - [x] Delete button aria-label: `Delete task: {todo.text}`
- [x] Task 7: Update `TodoList` to pass `onDelete` through (AC: #3)
  - [x] Update `TodoListProps` interface to accept `onDelete: (id: string) => void`
  - [x] Pass `onDelete` to each `<TodoItem>` component
- [x] Task 8: Update `App.tsx` to wire `deleteTodo` (AC: #3)
  - [x] Destructure `deleteTodo` from `useTodos()` return value
  - [x] Pass `onDelete={deleteTodo}` to `<TodoList>`
- [x] Task 9: Add/update frontend tests (AC: #1, #3, #4, #5, #6, #7)
  - [x] Add `deleteTodo` tests to `packages/client/src/api/todoApi.test.ts`
  - [x] Add `deleteTodo` tests to `packages/client/src/hooks/useTodos.test.ts`
  - [x] Add delete button tests to `packages/client/src/components/TodoItem.test.tsx` — renders ×, click calls onDelete with stopPropagation, hover styling classes, aria-label
  - [x] Update `packages/client/src/components/TodoList.test.tsx` — test `onDelete` prop forwarding
  - [x] Verify empty state renders after last delete (existing EmptyState logic handles this via `todos.length === 0`)
- [x] Task 10: Run full test suite and verify no regressions (AC: all)
  - [x] All existing tests pass
  - [x] All new tests pass

### Review Findings

- [x] [Review][Patch] Delete failures are not handled in `useTodos.deleteTodo` [/Users/bilalshareef/Bilal/workspace/todo-app-bmad/packages/client/src/hooks/useTodos.ts:70]
- [x] [Review][Patch] No test verifies the empty-state transition after deleting the final todo [/Users/bilalshareef/Bilal/workspace/todo-app-bmad/packages/client/src/components/TodoList.test.tsx:19]
- [x] [Review][Patch] TodoItem tests do not verify the required delete-button hover styling classes [/Users/bilalshareef/Bilal/workspace/todo-app-bmad/packages/client/src/components/TodoItem.test.tsx:83]

## Dev Notes

### Architecture Compliance

- **Routes → Services → Prisma layering:** DELETE route handler is thin — validates via JSON Schema, calls `todoService.deleteTodo()`, returns envelope response. Business logic stays in service.
- **JSON Schema validation:** Fastify built-in schema validates params (`id` as UUID format) — no body needed for DELETE. This matches the PATCH route's `params` schema pattern.
- **Envelope response:** Return `{ data: { id } }` for success per epics spec. Error responses use Fastify default format.
- **todoApi.ts as single API layer:** All fetch calls go through this module. Components/hooks never call fetch directly.
- **Error handling in hooks only:** `useTodos.deleteTodo` handles errors. No try/catch in components.
- **Tailwind utilities only:** No custom CSS classes, no CSS modules.
- **Co-located tests:** Test files next to source files.

### Critical: TodoItem Restructure Required — Button Nesting

The current `TodoItem.tsx` uses a single `<button>` element for the entire row toggle. Adding a delete `<button>` inside it would create **invalid HTML** (nested buttons). The `<li>` content must be restructured:

**Current structure (from Story 2.1):**
```tsx
<li>
  <button role="checkbox" onClick={onToggle}>  // entire row is one button
    <span>checkbox</span>
    <span>text</span>
  </button>
</li>
```

**Required structure for Story 2.2:**
```tsx
<li className="flex items-center">
  <button role="checkbox" onClick={onToggle} className="flex-1 flex items-center gap-3 ...">
    <span>checkbox</span>
    <span>text</span>
  </button>
  <button onClick={handleDelete} aria-label="Delete task: {text}" className="...">
    ×
  </button>
</li>
```

This keeps the toggle button and delete button as **siblings** inside the `<li>`. The toggle button takes `flex-1` to fill available space. The delete button is separate, so `stopPropagation` on the delete button prevents event bubbling to the `<li>` but is technically not needed for the toggle since they're siblings — however, include it defensively in case any parent-level click handlers exist.

**Key consideration:** The existing `onKeyDown` handler for space key on the toggle button must be preserved. The delete button gets standard `<button>` behavior (Enter/Space to activate).

### Delete Button Visibility — Mobile vs Desktop (UX-DR9)

Per the UX design spec (UX-DR9): the delete button is **always visible on mobile** and **hover-reveal on desktop only**. However, since the epics spec for Story 2.2 shows the button as always visible (no mention of hover-to-reveal behavior), and the acceptance criteria state "the × button is visible" without conditional visibility, implement the delete button as **always visible on all devices**. The hover styling (color/background change) is desktop-only via `@media(hover:hover)`.

### Backend DELETE Route — JSON Schema

```typescript
const deleteTodoSchema = {
  params: {
    type: 'object' as const,
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
  },
}
```

### Backend deleteTodo Service

```typescript
export async function deleteTodo(prisma: PrismaClient, id: string) {
  return prisma.todo.delete({ where: { id } })
}
```

Handle Prisma `P2025` in the route handler — **reuse the exact same pattern from the PATCH route:**
```typescript
fastify.delete('/:id', { schema: deleteTodoSchema }, async (request, reply) => {
  const { id } = request.params as { id: string }
  try {
    const todo = await deleteTodo(fastify.prisma, id)
    return { data: { id: todo.id } }
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2025') {
      return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Todo not found' })
    }
    throw error
  }
})
```

### Frontend API — deleteTodo

```typescript
export async function deleteTodo(id: string): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Failed to delete todo: ${response.status}`)
  }
  const { data } = await response.json()
  return data
}
```

### Frontend Hook — deleteTodo

```typescript
async function deleteTodo(id: string): Promise<void> {
  await apiDeleteTodo(id)
  setTodos((prev) => prev.filter((t) => t.id !== id))
}
```

**Note:** No optimistic update in this story. Per the epics description, optimistic UI with rollback is mentioned, but Story 3.2 (Optimistic UI with Rollback & Error Recovery) explicitly handles the optimistic delete pattern including rollback. This story implements the basic delete flow — remove from state after successful API response. When Story 3.2 is implemented, it will add: (1) optimistic removal before API call, (2) revert on failure with position restoration, (3) toast notification.

### Prop Chain Updates

| Component | Current Props | New Props |
|-----------|--------------|-----------|
| `App.tsx` | `useTodos()` returns `{ todos, addTodo, toggleTodo, loading }` | Returns `{ todos, addTodo, toggleTodo, deleteTodo, loading }` |
| `TodoList` | `{ todos, loading, onToggle }` | `{ todos, loading, onToggle, onDelete: (id: string) => void }` |
| `TodoItem` | `{ todo, onToggle }` | `{ todo, onToggle, onDelete: (id: string) => void }` |

### Tailwind Design Tokens

From `packages/client/src/App.css` `@theme` block — already available:
- `text-near-black` → `#111827` ✓
- `text-completed-gray` → `#9CA3AF` ✓
- `bg-warm-gray` → `#F9FAFB` ✓
- `bg-accent-blue` → `#3B82F6` ✓
- `text-error-red` → `#EF4444` ✓ (check if defined — if not, use `text-[#EF4444]`)

**Not in theme (use arbitrary values):**
- `#D1D5DB` for delete button default color → `text-[#D1D5DB]`
- `#FEE2E2` for delete button hover background → `bg-[#FEE2E2]`

### Delete Button Dimensions and Styling

- UX spec: 32px hit area = `w-8 h-8` in Tailwind (2rem = 32px)
- Use `flex items-center justify-center` for centering the × character
- The × character should be rendered as text content (`×` or `\u00D7`), not an SVG icon
- Font size: use `text-lg` or `text-xl` for appropriate × size
- Add `rounded` for subtle rounded corners on hover background

### Empty State After Last Delete (AC: #7)

The empty state transition is **already handled** by `TodoList.tsx`:
```tsx
if (todos.length === 0) {
  return <EmptyState />
}
```
When `deleteTodo` removes the last item from the `todos` array, `TodoList` automatically renders `<EmptyState />`. No additional logic needed.

### Files to Modify (NOT Create)

| File | Action |
|------|--------|
| `packages/server/src/services/todoService.ts` | Add `deleteTodo` function |
| `packages/server/src/routes/todos.ts` | Add DELETE `/:id` route with JSON Schema, import `deleteTodo` |
| `packages/server/src/app.test.ts` | Add DELETE endpoint tests |
| `packages/client/src/api/todoApi.ts` | Add `deleteTodo` function |
| `packages/client/src/api/todoApi.test.ts` | Add `deleteTodo` tests |
| `packages/client/src/hooks/useTodos.ts` | Add `deleteTodo`, return it, import `deleteTodo` from API |
| `packages/client/src/hooks/useTodos.test.ts` | Add `deleteTodo` tests |
| `packages/client/src/components/TodoItem.tsx` | Restructure to add delete button as sibling, stopPropagation |
| `packages/client/src/components/TodoItem.test.tsx` | Add delete button rendering, click, aria-label tests |
| `packages/client/src/components/TodoList.tsx` | Accept and pass `onDelete` prop |
| `packages/client/src/components/TodoList.test.tsx` | Test `onDelete` forwarding |
| `packages/client/src/App.tsx` | Wire `deleteTodo` to TodoList |

### New Files to Create

None. All changes are to existing files.

### Files That Should NOT Be Modified

| File | Reason |
|------|--------|
| `packages/client/src/components/AppShell.tsx` | Layout component — no changes needed |
| `packages/client/src/components/TodoInput.tsx` | Input component — unchanged for this story |
| `packages/client/src/components/EmptyState.tsx` | Already handles empty display — no changes needed |
| `packages/client/src/components/LoadingIndicator.tsx` | Loading — unchanged |
| `packages/client/src/types/todo.ts` | `Todo` type already has all needed fields |
| `packages/server/prisma/schema.prisma` | Schema already has all needed fields |
| `packages/client/src/App.css` | Theme tokens already sufficient |

### Testing Strategy

**Backend tests** (in `app.test.ts`):
- Follow existing test patterns: use `createApp()`, inject requests via `app.inject()`
- Create a todo first via POST, then DELETE it
- Verify the deleted todo is gone by checking GET response
- Test 404 for non-existent UUID
- Test 400 for invalid (non-UUID) id format — schema validation catches this

**Frontend API tests** (in `todoApi.test.ts`):
- Mock `fetch` globally (matching existing pattern with `global.fetch = jest.fn(...)`)
- Test `deleteTodo` calls DELETE with correct URL
- Test it returns parsed `{ id }` data
- Test error throwing on non-OK response

**Frontend hook tests** (in `useTodos.test.ts`):
- Mock `todoApi` module (matching existing pattern)
- Test `deleteTodo` removes todo from state after successful API call
- Test that the remaining todos are preserved

**Frontend component tests** (in `TodoItem.test.tsx`):
- Test delete button renders with × text
- Test click on delete button calls `onDelete` with todo id
- Test click on delete button does NOT call `onToggle` (stopPropagation verification)
- Test delete button has correct `aria-label="Delete task: {todo.text}"`

### Previous Story Intelligence

From Story 2.1 (Complete Todo — most recent):
- **Prisma P2025 error handling pattern:** Use `error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2025'` duck-typing. Do NOT import `Prisma` namespace directly — it causes Jest `import.meta.url` issues.
- **UUID format validation:** The PATCH route already uses `format: 'uuid'` on params schema — reuse this exact pattern for DELETE.
- **Toggle guard pattern:** `pendingToggleIds` ref prevents duplicate PATCH requests. Consider if similar deduplication is needed for delete (less critical since delete is one-way, but could prevent double-click issues).
- **Test count at last story:** 67 total (21 backend + 46 frontend), all passing.
- **Console.error pattern:** The hook uses `console.error` in catch blocks. Follow same pattern for delete errors (will be replaced with toast in Story 3.2).
- **Button role="checkbox":** TodoItem uses `<button role="checkbox">` for the toggle. This must be preserved when restructuring.

### Git Intelligence

- Commit pattern: `feat: story X.Y description` for implementations
- All work on `main` branch, linear history
- Latest commit: `39269af feat: story 2.1 complete todo full stack`
- Pattern: story file is committed first (`feat: add story X.Y`), then implementation (`feat: story X.Y description`)

### Project Structure Notes

- All modifications align with the flat `src/components/` directory structure
- No new directories or files needed — purely extending existing modules
- The DELETE endpoint extends the existing `/api/todos` route plugin (same file as GET, POST, PATCH)
- `deleteTodo` service follows the same pattern as existing `createTodo`, `getAllTodos`, and `updateTodo`

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — API Endpoints table, Implementation Patterns, Anti-Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR4, UX-DR9, UX-DR13]
- [Source: _bmad-output/planning-artifacts/prd.md — FR9, FR10]
- [Source: _bmad-output/implementation-artifacts/2-1-complete-todo-full-stack.md — Previous Story Intelligence]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

- Backend test syntax error (extra closing brace) fixed during Task 3 execution

### Completion Notes List

- Task 1: Added `deleteTodo(prisma, id)` to todoService.ts — follows existing pattern of `updateTodo`
- Task 2: Added DELETE `/:id` route with JSON Schema validation (UUID format on params) and P2025 error handling — reused PATCH route pattern exactly
- Task 3: Added 4 backend tests — DELETE 200, verify deletion via GET, 404 for non-existent UUID, 400 for invalid id
- Task 4: Added `deleteTodo(id)` to todoApi.ts — sends DELETE, parses envelope, throws on error
- Task 5: Added `deleteTodo(id)` to useTodos hook — calls API, filters from state on success, returned from hook
- Task 6: Restructured TodoItem to avoid nested buttons (invalid HTML). Toggle button and delete button are siblings in `<li className="flex items-center">`. Delete button: × text, 32px hit area, `stopPropagation`, hover color transition via `@media(hover:hover)`, `aria-label="Delete task: {text}"`
- Task 7: Updated TodoList to accept and forward `onDelete` prop to each TodoItem
- Task 8: Wired `deleteTodo` from useTodos hook through App.tsx to TodoList
- Task 9: Added 10 new frontend tests: 3 API tests (deleteTodo URL, response parsing, error), 2 hook tests (remove from state, preserve remaining), 5 TodoItem tests (renders ×, click calls onDelete, no toggle on delete click, aria-label, 32px hit area). Updated all existing TodoItem and TodoList tests with onDelete prop
- Task 10: Full regression — 87 tests pass (26 backend + 61 frontend), 0 lint errors

### File List

- `packages/server/src/services/todoService.ts` — modified (added `deleteTodo`)
- `packages/server/src/routes/todos.ts` — modified (added DELETE route, schema, import)
- `packages/server/src/app.test.ts` — modified (added 4 DELETE tests)
- `packages/client/src/api/todoApi.ts` — modified (added `deleteTodo`)
- `packages/client/src/api/todoApi.test.ts` — modified (added 3 deleteTodo tests)
- `packages/client/src/hooks/useTodos.ts` — modified (added `deleteTodo`, import, return)
- `packages/client/src/hooks/useTodos.test.ts` — modified (added 2 deleteTodo tests)
- `packages/client/src/components/TodoItem.tsx` — modified (restructured: added delete button, onDelete prop, stopPropagation)
- `packages/client/src/components/TodoItem.test.tsx` — modified (added 5 delete tests, updated all renders with onDelete)
- `packages/client/src/components/TodoList.tsx` — modified (added onDelete prop, forwarded to TodoItem)
- `packages/client/src/components/TodoList.test.tsx` — modified (added onDelete forwarding test, updated all renders)
- `packages/client/src/App.tsx` — modified (destructure deleteTodo, pass onDelete to TodoList)

## Change Log

- 2026-04-27: Implemented Story 2.2 Delete Todo Full Stack — added DELETE endpoint, frontend API/hook/component wiring, delete button with stopPropagation, 20 new tests (87 total), all passing
