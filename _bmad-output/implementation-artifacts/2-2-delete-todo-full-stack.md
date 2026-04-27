# Story 2.2: Delete Todo — Full Stack

Status: ready-for-dev

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

- [ ] Task 1: Add `deleteTodo` to backend service layer (AC: #2)
  - [ ] Add `deleteTodo(prisma, id)` function to `packages/server/src/services/todoService.ts`
  - [ ] Accept `id: string` parameter
  - [ ] Use `prisma.todo.delete({ where: { id } })`
  - [ ] Return the deleted todo (Prisma returns it by default)
  - [ ] Prisma `P2025` (record not found) will throw — let route handler catch it
- [ ] Task 2: Add DELETE route to backend (AC: #1, #2)
  - [ ] Add DELETE `/:id` route to `packages/server/src/routes/todos.ts`
  - [ ] Import `deleteTodo` from service
  - [ ] Define JSON Schema for request: `params` with `id` (string, UUID format) — no body needed
  - [ ] Define response schema for 200 with `{ data: { id: string } }` envelope
  - [ ] Call `deleteTodo(fastify.prisma, id)` from service
  - [ ] Return `{ data: { id: deletedTodo.id } }` with 200 status
  - [ ] Handle not-found: catch Prisma P2025, return 404 with `{ statusCode: 404, error: "Not Found", message: "Todo not found" }`
  - [ ] Reuse the same P2025 error pattern from the existing PATCH route
- [ ] Task 3: Add backend tests for DELETE route (AC: #1, #2)
  - [ ] Add DELETE tests to `packages/server/src/app.test.ts`
  - [ ] Test: DELETE `/api/todos/:id` returns 200 with `{ data: { id } }`
  - [ ] Test: deleted todo no longer appears in GET `/api/todos`
  - [ ] Test: DELETE with non-existent UUID returns 404
  - [ ] Test: DELETE with invalid (non-UUID) id returns 400
- [ ] Task 4: Add `deleteTodo` to frontend API layer (AC: #1)
  - [ ] Add `deleteTodo(id)` function to `packages/client/src/api/todoApi.ts`
  - [ ] Send DELETE to `/api/todos/${id}` — no body needed
  - [ ] Parse and return `data` from envelope response
  - [ ] Throw on non-OK response (matching existing pattern)
- [ ] Task 5: Add `deleteTodo` to `useTodos` hook (AC: #1, #3)
  - [ ] Add `deleteTodo(id: string)` function to `packages/client/src/hooks/useTodos.ts`
  - [ ] Call `apiDeleteTodo(id)` from `todoApi`
  - [ ] On success: remove the todo from state via `setTodos((prev) => prev.filter((t) => t.id !== id))`
  - [ ] Return `deleteTodo` from the hook
- [ ] Task 6: Update `TodoItem` component with delete button (AC: #3, #4, #5, #6)
  - [ ] Add `onDelete: (id: string) => void` prop to `TodoItemProps`
  - [ ] Add × button inside the `<li>` — positioned after the text span, right-aligned
  - [ ] × button must call `e.stopPropagation()` then `onDelete(todo.id)` — prevent toggle
  - [ ] **Important:** The × button is a nested `<button>` inside the existing toggle `<button>`. To avoid button nesting (invalid HTML), restructure the `<li>` so the toggle area and delete button are siblings, not nested. Use a `<div>` wrapper with `onClick` for the toggle zone, and a separate `<button>` for delete.
  - [ ] Styling: 32px hit area (`w-8 h-8`), flex centered, `text-[#D1D5DB]` default, transparent background
  - [ ] Hover styling: `text-error-red` (`#EF4444`), `bg-[#FEE2E2]` — scoped with `[@media(hover:hover)]:hover:` prefix
  - [ ] 150ms transition on color and background (`transition-colors duration-150`)
  - [ ] Rounded corners on hover background (`rounded`)
  - [ ] Delete button aria-label: `Delete task: {todo.text}`
- [ ] Task 7: Update `TodoList` to pass `onDelete` through (AC: #3)
  - [ ] Update `TodoListProps` interface to accept `onDelete: (id: string) => void`
  - [ ] Pass `onDelete` to each `<TodoItem>` component
- [ ] Task 8: Update `App.tsx` to wire `deleteTodo` (AC: #3)
  - [ ] Destructure `deleteTodo` from `useTodos()` return value
  - [ ] Pass `onDelete={deleteTodo}` to `<TodoList>`
- [ ] Task 9: Add/update frontend tests (AC: #1, #3, #4, #5, #6, #7)
  - [ ] Add `deleteTodo` tests to `packages/client/src/api/todoApi.test.ts`
  - [ ] Add `deleteTodo` tests to `packages/client/src/hooks/useTodos.test.ts`
  - [ ] Add delete button tests to `packages/client/src/components/TodoItem.test.tsx` — renders ×, click calls onDelete with stopPropagation, hover styling classes, aria-label
  - [ ] Update `packages/client/src/components/TodoList.test.tsx` — test `onDelete` prop forwarding
  - [ ] Verify empty state renders after last delete (existing EmptyState logic handles this via `todos.length === 0`)
- [ ] Task 10: Run full test suite and verify no regressions (AC: all)
  - [ ] All existing tests pass
  - [ ] All new tests pass

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

### Debug Log References

### Completion Notes List

### File List
