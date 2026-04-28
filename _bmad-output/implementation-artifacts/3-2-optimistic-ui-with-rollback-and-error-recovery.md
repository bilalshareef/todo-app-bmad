# Story 3.2: Optimistic UI with Rollback & Error Recovery

Status: ready-for-dev

## Story

As a user,
I want my actions to feel instant but honestly roll back if something fails,
So that I'm never left with a false impression of what's saved.

## Acceptance Criteria

1. **Given** the user creates a new todo **When** the POST request fails (network error or API error) **Then** the todo does NOT appear in the list (no false persistence — FR18) **And** the cached input text is restored to the input field so the user can retry without retyping **And** a toast appears: "Couldn't save your task — check your connection and try again"

2. **Given** the user toggles a todo's completion status **When** the PATCH request fails **Then** the checkbox and text styling revert to the previous state **And** a toast appears: "Couldn't update — check your connection"

3. **Given** the user deletes a todo **When** the DELETE request fails **Then** the todo is restored to its position in the list **And** a toast appears: "Couldn't delete — check your connection"

4. **Given** the app is loading todos on startup **When** the GET request fails **Then** a toast appears: "Couldn't load your tasks — check your connection" **And** the list area shows empty (no stale data) **And** the input field remains usable — the user can still attempt to add tasks

5. **Given** any API error occurs **When** the error is processed **Then** existing application state is not corrupted (NFR13) **And** no unhandled exceptions cause a blank screen or frozen UI (NFR12)

## Current State Analysis

**CRITICAL: Most of this story's requirements are already partially or fully implemented.** The dev agent MUST carefully read the current code before making any changes to avoid regressions.

### Already Working (DO NOT BREAK)

| AC | Behavior | Implementation Location |
|----|----------|------------------------|
| AC #1 | Create failure: todo does NOT appear in list | `useTodos.addTodo` — only adds to state on success, re-throws on failure |
| AC #1 | Input text preserved on create failure | `TodoInput.handleKeyDown` — catches error, keeps `value` state unchanged |
| AC #1 | Toast on create failure | `useTodos.addTodo` — calls `onError?.("Couldn't save your task — ...")` before re-throwing |
| AC #4 | Toast on load failure | `useTodos` useEffect — calls `onError?.("Couldn't load your tasks — ...")` |
| AC #4 | Empty list on load failure, input usable | `useTodos` — sets `loading: false`, `todos` stays `[]` |
| AC #5 | No unhandled exceptions | All error paths have try/catch in hooks; `TodoInput` catches re-thrown `addTodo` error |

### Needs Implementation

| AC | What's Missing | Current Behavior |
|----|----------------|-----------------|
| AC #2 | Optimistic toggle with rollback | `toggleTodo` calls API first, only updates state on success. UI waits for server response — not instant. |
| AC #3 | Optimistic delete with rollback | `deleteTodo` calls API first, only removes from state on success. UI waits for server response — not instant. |

## Tasks / Subtasks

- [ ] Task 1: Add optimistic toggle to `useTodos.toggleTodo` (AC: #2, #5)
  - [ ] 1.1: Immediately update state to flip `completed` before the API call:
    ```typescript
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t))
    ```
  - [ ] 1.2: On API success, replace the optimistic todo with the server-returned todo (to get the correct `updatedAt` timestamp):
    ```typescript
    setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)))
    ```
  - [ ] 1.3: On API failure, revert to the original todo object (captured before the optimistic update):
    ```typescript
    // Capture before optimistic update
    const originalTodo = todos.find((t) => t.id === id)
    // ... on failure:
    setTodos((prev) => prev.map((t) => (t.id === id ? originalTodo : t)))
    ```
  - [ ] 1.4: Keep the existing `pendingToggleIds` guard to prevent duplicate rapid toggles
  - [ ] 1.5: Toast call on failure is already in place (`onError?.("Couldn't update — check your connection")`) — verify it still fires after the revert

- [ ] Task 2: Add optimistic delete to `useTodos.deleteTodo` (AC: #3, #5)
  - [ ] 2.1: Capture the todo object and its index before removing:
    ```typescript
    const todoIndex = todos.findIndex((t) => t.id === id)
    const deletedTodo = todos[todoIndex]
    ```
  - [ ] 2.2: Immediately remove the todo from state before the API call:
    ```typescript
    setTodos((prev) => prev.filter((t) => t.id !== id))
    ```
  - [ ] 2.3: On API success, do nothing (todo already removed)
  - [ ] 2.4: On API failure, restore the todo to its original position using the captured index:
    ```typescript
    setTodos((prev) => {
      const restored = [...prev]
      restored.splice(todoIndex, 0, deletedTodo)
      return restored
    })
    ```
  - [ ] 2.5: Toast call on failure is already in place (`onError?.("Couldn't delete — check your connection")`) — verify it still fires after the restore

- [ ] Task 3: Update `useTodos.test.ts` for optimistic toggle behavior (AC: #2)
  - [ ] 3.1: Update existing test "toggleTodo flips completed state and updates todo in state" — state should now change immediately (optimistically) and then update to server response
  - [ ] 3.2: Update existing test "toggleTodo preserves state when update fails" — state should now first change optimistically, then revert on failure. The test must verify:
    - State immediately changes after `toggleTodo` is called (before API resolves)
    - State reverts to original when API rejects
  - [ ] 3.3: Add new test: "toggleTodo applies optimistic update immediately before API resolves"
    - Use a deferred promise for `apiUpdateTodo` so we can observe intermediate state
    - Verify `completed` is flipped in state before the promise resolves
  - [ ] 3.4: Verify existing "toggleTodo ignores repeated clicks while a request is in flight" test still passes with optimistic UI
  - [ ] 3.5: Verify existing "toggleTodo flips completed todo back to uncompleted" test still passes

- [ ] Task 4: Update `useTodos.test.ts` for optimistic delete behavior (AC: #3)
  - [ ] 4.1: Update existing test "deleteTodo removes todo from state after successful API call" — state should now be removed immediately (not after API success)
  - [ ] 4.2: Update existing test "deleteTodo leaves state unchanged when the API call fails" — state should now:
    - Immediately remove the todo (optimistic)
    - Restore the todo to its original position when API rejects
  - [ ] 4.3: Add new test: "deleteTodo applies optimistic removal immediately before API resolves"
    - Use a deferred promise for `apiDeleteTodo` so we can observe intermediate state
    - Verify the todo is removed from state before the promise resolves
  - [ ] 4.4: Add new test: "deleteTodo restores todo to correct position on failure"
    - Setup: 3 todos [A, B, C]. Delete B. API fails. Verify B is restored between A and C.
  - [ ] 4.5: Verify existing "deleteTodo preserves remaining todos" test still passes

- [ ] Task 5: Verify create and load error flows still work (AC: #1, #4)
  - [ ] 5.1: Run existing tests for `addTodo` failure — no changes expected, just verify they pass
  - [ ] 5.2: Run existing tests for `fetchTodos` failure — no changes expected, just verify they pass
  - [ ] 5.3: Verify `TodoInput` still preserves text on create failure (run `TodoInput.test.tsx`)

- [ ] Task 6: Run full test suite and verify no regressions (AC: all)
  - [ ] 6.1: `cd packages/client && npx jest --coverage`
  - [ ] 6.2: `cd packages/server && npx jest`
  - [ ] 6.3: All existing tests pass (updated as needed for optimistic behavior)
  - [ ] 6.4: All new tests pass
  - [ ] 6.5: No TypeScript errors (`npx tsc --noEmit` in both packages)

## Dev Notes

### Architecture Compliance

- **Error handling in hooks only:** All optimistic update/rollback logic lives in `useTodos`. No try/catch in components.
- **Toast as single error channel:** Toast messages are already wired via `onError` callback from Story 3.1. No changes to toast infrastructure needed.
- **No success toasts:** Successful optimistic operations update state silently.
- **No false persistence (FR18):** `addTodo` intentionally does NOT use optimistic UI — the todo only appears after API success. This is correct and must not change.
- **Component purity:** `TodoItem` and `TodoInput` remain purely presentational. All state management stays in `useTodos`.

### Critical Pattern: Optimistic vs. Non-Optimistic

The architecture defines the optimistic update pattern as:
1. Apply state change immediately in the UI
2. Fire API request in background
3. On success: keep new state
4. On failure: revert to previous state + show toast
5. **Special case for create:** Cache input text, clear field, restore text on failure

**IMPORTANT DISTINCTION:** The "create" flow is NOT optimistic in the traditional sense. The todo does NOT appear in the list optimistically. Instead:
- The input text is cached (by `TodoInput` keeping the value)
- The input clears on success
- The input text is restored on failure (by `TodoInput` catching the re-thrown error)

This is per FR18: "System does not display a todo in the list unless it has been successfully persisted."

**Only toggle and delete use true optimistic updates** (apply UI change → fire API → revert on failure).

### Implementation Details for `toggleTodo` Refactor

Current implementation:
```typescript
async function toggleTodo(id: string): Promise<void> {
  if (pendingToggleIds.current.has(id)) return
  const todo = todos.find((t) => t.id === id)
  if (!todo) return
  pendingToggleIds.current.add(id)
  try {
    const updatedTodo = await apiUpdateTodo(id, !todo.completed)
    setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)))
  } catch (error) {
    onError?.("Couldn't update — check your connection")
  } finally {
    pendingToggleIds.current.delete(id)
  }
}
```

Target implementation:
```typescript
async function toggleTodo(id: string): Promise<void> {
  if (pendingToggleIds.current.has(id)) return
  const todo = todos.find((t) => t.id === id)
  if (!todo) return
  pendingToggleIds.current.add(id)

  // Optimistic update — flip immediately
  const newCompleted = !todo.completed
  setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: newCompleted } : t))

  try {
    const updatedTodo = await apiUpdateTodo(id, newCompleted)
    // Replace with server data (has correct updatedAt)
    setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)))
  } catch (error) {
    // Revert to original state
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: todo.completed } : t))
    onError?.("Couldn't update — check your connection")
  } finally {
    pendingToggleIds.current.delete(id)
  }
}
```

### Implementation Details for `deleteTodo` Refactor

Current implementation:
```typescript
async function deleteTodo(id: string): Promise<void> {
  try {
    await apiDeleteTodo(id)
    setTodos((prev) => prev.filter((t) => t.id !== id))
  } catch (error) {
    onError?.("Couldn't delete — check your connection")
  }
}
```

Target implementation:
```typescript
async function deleteTodo(id: string): Promise<void> {
  const todoIndex = todos.findIndex((t) => t.id === id)
  if (todoIndex === -1) return
  const deletedTodo = todos[todoIndex]

  // Optimistic removal — remove immediately
  setTodos((prev) => prev.filter((t) => t.id !== id))

  try {
    await apiDeleteTodo(id)
  } catch (error) {
    // Restore to original position
    setTodos((prev) => {
      const restored = [...prev]
      restored.splice(todoIndex, 0, deletedTodo)
      return restored
    })
    onError?.("Couldn't delete — check your connection")
  }
}
```

### Test Changes Summary

**Modified tests** (behavior changes, not new tests):
- `toggleTodo flips completed state...` — state now changes immediately, not after API
- `toggleTodo preserves state when update fails` — state now changes then reverts, not stays unchanged
- `deleteTodo removes todo from state...` — removal now happens immediately, not after API
- `deleteTodo leaves state unchanged when the API call fails` — state now removes then restores, not stays unchanged

**New tests:**
- `toggleTodo applies optimistic update immediately before API resolves`
- `deleteTodo applies optimistic removal immediately before API resolves`
- `deleteTodo restores todo to correct position on failure`

**Unchanged tests** (behavior is the same):
- All `addTodo` tests — no changes to create flow
- All `fetchTodos` tests — no changes to load flow
- `toggleTodo does nothing for non-existent todo id` — early return, no optimistic update
- `toggleTodo ignores repeated clicks while a request is in flight` — guard still works
- `deleteTodo preserves remaining todos` — remaining todos unaffected

### Files to Create

None — this story only modifies existing files.

### Files to Modify

| File | Change |
|------|--------|
| `packages/client/src/hooks/useTodos.ts` | Add optimistic update to `toggleTodo`, add optimistic removal to `deleteTodo` |
| `packages/client/src/hooks/useTodos.test.ts` | Update existing tests for optimistic behavior, add new optimistic/rollback tests |

### Files Unchanged (Verify No Regressions)

| File | Reason |
|------|--------|
| `packages/client/src/components/TodoInput.tsx` | Create failure text preservation already works |
| `packages/client/src/components/TodoItem.tsx` | Purely presentational, no state logic |
| `packages/client/src/components/Toast.tsx` | Toast infrastructure from Story 3.1, no changes |
| `packages/client/src/hooks/useToast.ts` | Toast state management from Story 3.1, no changes |
| `packages/client/src/api/todoApi.ts` | API layer unchanged |
| `packages/client/src/App.tsx` | Wiring unchanged |
| `packages/server/src/**` | No backend changes |

### Previous Story Learnings (from Story 3.1)

- **`addTodo` must still re-throw after calling `onError`:** Story 3.1 explicitly noted this requirement for input text restoration. The `throw error` in the `addTodo` catch block is critical — do NOT remove it.
- **`pendingToggleIds` ref prevents duplicate toggles:** This guard was added to prevent double-toggle issues. It must be preserved with optimistic UI.
- **Co-located test files:** All tests next to their source files.
- **`console.error` was fully removed in Story 3.1** — toast is the single error channel. Do not re-add `console.error`.
- **Review findings from Story 3.1:** The `TodoInput` was patched to properly catch the re-thrown `addTodo` error (preventing unhandled promise rejection). This fix is already in place.

### Edge Cases to Consider

1. **Rapid toggle → API failure:** User clicks toggle, sees optimistic flip, then API fails. The revert should use the captured `todo.completed` value, not re-read from state (which may have changed due to the optimistic update).
2. **Delete last todo → API failure:** Deleting the last todo shows the empty state. If the API fails, the todo is restored and the empty state should disappear. This should work automatically since `TodoList` renders based on `todos.length`.
3. **Delete middle todo → restore position:** When restoring a deleted todo on failure, it must go back to its original index position, not the end of the list. Use `splice` with the captured `todoIndex`.
4. **Stale closure in `deleteTodo`:** The `todos` reference used to find the index and capture the todo is from the render cycle when `deleteTodo` was created. This is fine because:
   - The `todoIndex` and `deletedTodo` are captured at call time
   - The restoration uses a functional `setTodos` update, which gets the latest state
5. **Position drift on delete restore:** If another todo is deleted (or added) between the optimistic delete and the failure, the captured `todoIndex` may no longer be the exact correct position. This is an acceptable edge case for an MVP — the todo will still be restored, just potentially at a slightly different position. The alternative (tracking by neighbor IDs) adds complexity for a rare scenario.

### Error Messages (Already Configured — Do Not Change)

| Operation | Toast Message |
|-----------|--------------|
| Fetch fails | "Couldn't load your tasks — check your connection" |
| Create fails | "Couldn't save your task — check your connection and try again" |
| Toggle fails | "Couldn't update — check your connection" |
| Delete fails | "Couldn't delete — check your connection" |

### Project Structure Notes

No new files or structural changes. The `useTodos` hook is the only file with logic changes. The project structure remains aligned with the architecture specification.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Optimistic Update Pattern" section]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Error Handling (Frontend)" section]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Anti-Patterns to Avoid" section]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — "Task Lifecycle Flow" mermaid diagram]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — "Optimistic-feeling but honest UI" pattern]
- [Source: _bmad-output/planning-artifacts/prd.md — FR18 (no false persistence), NFR12 (no blank screens), NFR13 (no state corruption)]
- [Source: _bmad-output/implementation-artifacts/3-1-toast-notification-system.md — "useTodos Integration Pattern", "addTodo must still throw"]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)
