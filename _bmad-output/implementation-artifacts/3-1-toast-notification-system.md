# Story 3.1: Toast Notification System

Status: ready-for-dev

## Story

As a user,
I want to see clear, friendly error messages when something goes wrong,
So that I know what happened and can take action to fix it.

## Acceptance Criteria

1. **Given** an error occurs in any operation **When** the error is caught by the `useTodos` hook **Then** a toast notification slides in from the bottom-right of the screen (0.3s ease animation)

2. **And** the toast has: dark background (#1F2937), white text, red accent icon (⚠️, #EF4444)

3. **And** the toast text is 14px, medium weight (500)

4. **And** the toast has max-width 360px, padding 14px 20px, border-radius 8px

5. **And** the toast has `role="alert"` and `aria-live="polite"` for screen reader announcement

6. **And** the toast auto-dismisses after 4 seconds with a fade-out (0.3s ease) animation

7. **And** if a new error occurs while a toast is visible, the new toast replaces the current one (no stacking)

8. **Given** no error has occurred **When** a CRUD operation succeeds **Then** no toast is shown — no success toasts, no inline feedback beyond the state change itself

## Tasks / Subtasks

- [ ] Task 1: Add toast animation keyframes to Tailwind theme (AC: #1, #6)
  - [ ] Add `@keyframes toast-slide-in` to `packages/client/src/App.css` at root level (below the `@theme` block): translate from `translateY(100%)` + `opacity: 0` to `translateY(0)` + `opacity: 1`, duration handled by Tailwind `animate-` utility
  - [ ] Add `@keyframes toast-fade-out` at root level: from `opacity: 1` to `opacity: 0`, duration handled by Tailwind `animate-` utility
  - [ ] Register custom animations in the `@theme` block: `--animate-toast-slide-in: toast-slide-in 0.3s ease forwards` and `--animate-toast-fade-out: toast-fade-out 0.3s ease forwards`
- [ ] Task 2: Create `useToast` hook (AC: #6, #7)
  - [ ] Create `packages/client/src/hooks/useToast.ts`
  - [ ] State shape: `{ message: string | null; visible: boolean; exiting: boolean }`
  - [ ] `showToast(message: string)`:
    - If a toast is already visible, clear the existing auto-dismiss timer
    - Set `{ message, visible: true, exiting: false }`
    - Start a new 4-second timer that calls `startExit()`
  - [ ] `startExit()` (internal):
    - Set `exiting: true` to trigger fade-out animation
    - After 300ms (matching animation duration), set `{ message: null, visible: false, exiting: false }`
  - [ ] `hideToast()`:
    - Clear any active timer
    - Set `{ message: null, visible: false, exiting: false }` immediately
  - [ ] Clean up timer on unmount via `useEffect` return
  - [ ] Use `useRef` for timer IDs to avoid stale closures
  - [ ] Return `{ toast: { message, visible, exiting }, showToast, hideToast }`
- [ ] Task 3: Create `Toast` component (AC: #1, #2, #3, #4, #5)
  - [ ] Create `packages/client/src/components/Toast.tsx`
  - [ ] Props: `{ message: string | null; visible: boolean; exiting: boolean }`
  - [ ] If not `visible`, return `null` (do not render)
  - [ ] Render a `<div>` with:
    - `role="alert"` and `aria-live="polite"`
    - Fixed position: `fixed bottom-4 right-4` (Tailwind)
    - Background: `bg-toast-dark` (#1F2937)
    - Text: `text-white text-sm font-medium` (14px = `text-sm`, weight 500 = `font-medium`)
    - Max width: `max-w-[360px]`
    - Padding: `py-[14px] px-5` (14px top/bottom, 20px left/right)
    - Border radius: `rounded-lg` (8px)
    - Z-index: `z-50` to ensure toast renders above all content
    - Shadow: `shadow-lg` for visual elevation
  - [ ] Interior layout: flex row with gap
    - ⚠️ icon span with `text-error-red` (#EF4444) styling, flex-shrink-0
    - Message text span
  - [ ] Animation class: `animate-toast-slide-in` when `exiting` is false, `animate-toast-fade-out` when `exiting` is true
- [ ] Task 4: Modify `useTodos` hook to accept `onError` callback (AC: #1, #8)
  - [ ] Add `onError?: (message: string) => void` parameter to `useTodos()`
  - [ ] In `fetchTodos` catch block: replace `console.error('Failed to fetch todos:', err)` with `onError?.("Couldn't load your tasks — check your connection")`
  - [ ] In `toggleTodo` catch block: replace `console.error('Failed to update todo:', error)` with `onError?.("Couldn't update — check your connection")`
  - [ ] In `deleteTodo` catch block: replace `console.error('Failed to delete todo:', error)` with `onError?.("Couldn't delete — check your connection")`
  - [ ] In `addTodo`: wrap in try/catch, on failure call `onError?.("Couldn't save your task — check your connection and try again")` and re-throw the error (so the caller knows it failed — needed for Story 3.2 input text restoration)
  - [ ] **Important:** Do NOT remove the existing behavior of `addTodo` throwing on failure. The error must still propagate for the caller (`TodoInput` via `App.tsx`) to know the operation failed. The `onError` callback handles the toast, but the throw allows future rollback logic.
  - [ ] Remove all `console.error` calls — toast is now the single error channel
- [ ] Task 5: Wire `Toast` component in `App.tsx` (AC: #1)
  - [ ] Import `useToast` from `./hooks/useToast`
  - [ ] Import `Toast` from `./components/Toast`
  - [ ] Call `useToast()` to get `{ toast, showToast }`
  - [ ] Pass `showToast` to `useTodos(showToast)` as the `onError` callback
  - [ ] Render `<Toast message={toast.message} visible={toast.visible} exiting={toast.exiting} />` as the last child in the fragment (outside `<AppShell>` since it's fixed-positioned)
  - [ ] Updated `App.tsx` structure:
    ```tsx
    function App() {
      const { toast, showToast } = useToast()
      const { todos, addTodo, toggleTodo, deleteTodo, loading } = useTodos(showToast)
      return (
        <>
          <AppShell>
            <TodoInput onSubmit={addTodo} />
            <div className="mt-6">
              <TodoList todos={todos} loading={loading} onToggle={toggleTodo} onDelete={deleteTodo} />
            </div>
          </AppShell>
          <Toast message={toast.message} visible={toast.visible} exiting={toast.exiting} />
        </>
      )
    }
    ```
- [ ] Task 6: Create `useToast` hook tests (AC: #6, #7)
  - [ ] Create `packages/client/src/hooks/useToast.test.ts`
  - [ ] Test: `showToast` sets message and visible=true
  - [ ] Test: toast auto-dismisses after 4 seconds (use `jest.useFakeTimers()`)
  - [ ] Test: calling `showToast` again while visible replaces the message and resets the 4s timer
  - [ ] Test: `hideToast` clears toast immediately
  - [ ] Test: after 4s, `exiting` becomes true, then after 300ms, visible becomes false
  - [ ] Test: timer is cleaned up on unmount (no state updates after unmount)
  - [ ] Use `@testing-library/react` `renderHook` and `act` for hook testing
- [ ] Task 7: Create `Toast` component tests (AC: #1, #2, #3, #4, #5)
  - [ ] Create `packages/client/src/components/Toast.test.tsx`
  - [ ] Test: renders nothing when `visible` is false
  - [ ] Test: renders toast with message text when visible is true
  - [ ] Test: has `role="alert"` attribute
  - [ ] Test: has `aria-live="polite"` attribute
  - [ ] Test: renders ⚠️ icon
  - [ ] Test: applies `animate-toast-slide-in` class when `exiting` is false
  - [ ] Test: applies `animate-toast-fade-out` class when `exiting` is true
  - [ ] Test: has correct positioning classes (`fixed`, `bottom-4`, `right-4`)
- [ ] Task 8: Update `useTodos` hook tests (AC: #1, #8)
  - [ ] Update `packages/client/src/hooks/useTodos.test.ts`
  - [ ] Test: `onError` callback is called with correct message when `fetchTodos` fails
  - [ ] Test: `onError` callback is called with correct message when `addTodo` fails
  - [ ] Test: `onError` callback is called with correct message when `toggleTodo` fails
  - [ ] Test: `onError` callback is called with correct message when `deleteTodo` fails
  - [ ] Test: no `onError` callback called on successful operations
  - [ ] Test: `addTodo` still throws on failure (for Story 3.2 input text restoration)
- [ ] Task 9: Update `App.test.tsx` for toast integration (AC: #1)
  - [ ] Update `packages/client/src/App.test.tsx`
  - [ ] Verify `Toast` component is rendered in the DOM (even if hidden when no errors)
  - [ ] Ensure existing tests still pass with the new `useToast` integration
- [ ] Task 10: Run full test suite and verify no regressions (AC: all)
  - [ ] `cd packages/client && npx jest --coverage`
  - [ ] `cd packages/server && npx jest`
  - [ ] All existing tests pass
  - [ ] All new tests pass
  - [ ] No TypeScript errors (`npx tsc --noEmit` in both packages)

## Dev Notes

### Architecture Compliance

- **Error handling in hooks only:** All error catching stays in `useTodos`. The Toast component is purely presentational. No try/catch in components.
- **Toast as single error channel:** Replace all `console.error` calls with toast notifications. No inline error displays, no modals, no console-based error reporting.
- **No success toasts:** Only error toasts. Successful CRUD operations update state silently.
- **Tailwind utilities only:** All styling via Tailwind utility classes. Custom keyframe animations defined in `App.css` `@theme` block (matching existing pattern).
- **Co-located tests:** Test files next to source files (`Toast.test.tsx` next to `Toast.tsx`, etc.).
- **Component file naming:** PascalCase for component (`Toast.tsx`), camelCase with `use` prefix for hook (`useToast.ts`).

### Design Tokens Already Available

The following design tokens are already defined in `packages/client/src/App.css` `@theme` block and can be used directly as Tailwind classes:

| Token | CSS Variable | Tailwind Class | Value |
|-------|-------------|----------------|-------|
| Toast background | `--color-toast-dark` | `bg-toast-dark` | `#1F2937` |
| Error icon color | `--color-error-red` | `text-error-red` | `#EF4444` |
| Font weight medium | `--font-weight-medium` | `font-medium` | `500` |

**No new design tokens needed.** White text uses Tailwind's built-in `text-white`.

### Animation Implementation

Tailwind CSS v4 uses CSS-first configuration. Custom animations are defined in the `@theme` block:

```css
@theme {
  /* existing tokens... */
  --animate-toast-slide-in: toast-slide-in 0.3s ease forwards;
  --animate-toast-fade-out: toast-fade-out 0.3s ease forwards;
}

@keyframes toast-slide-in {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes toast-fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
```

These generate Tailwind classes `animate-toast-slide-in` and `animate-toast-fade-out`.

### Toast Replacement Logic (No Stacking)

When `showToast` is called while a toast is already visible:
1. Clear the existing 4-second auto-dismiss timer
2. Cancel any in-progress exit animation (reset `exiting` to false)
3. Update the message immediately
4. Start a fresh 4-second timer

This ensures only one toast is ever visible. No queue, no stack, no animation chaining.

### useTodos Integration Pattern

The `useTodos` hook gains an optional `onError` callback parameter:

```typescript
export function useTodos(onError?: (message: string) => void) {
  // ... existing state ...

  // fetchTodos error → onError?.("Couldn't load your tasks — ...")
  // addTodo error → onError?.("Couldn't save your task — ...") + re-throw
  // toggleTodo error → onError?.("Couldn't update — ...")
  // deleteTodo error → onError?.("Couldn't delete — ...")
}
```

**Critical: `addTodo` must still throw after calling `onError`.** Story 3.2 will add input text caching/restoration on create failure, which requires the caller to know the operation failed. The `onError` triggers the toast; the throw enables rollback in the caller.

### Error Messages (Conversational Tone per UX Spec)

| Operation | Toast Message |
|-----------|--------------|
| Fetch fails | "Couldn't load your tasks — check your connection" |
| Create fails | "Couldn't save your task — check your connection and try again" |
| Toggle fails | "Couldn't update — check your connection" |
| Delete fails | "Couldn't delete — check your connection" |

These match the UX spec's requirement for conversational, non-technical, actionable error messages.

### Previous Story Learnings (from Story 2.2)

- **Test coverage matters:** Story 2.2 review found missing error handling in `useTodos.deleteTodo`, missing empty-state transition tests, and missing hover styling tests. Ensure all error paths and styling are tested from the start.
- **Delete failure handling was patched:** The `deleteTodo` in `useTodos` now has a try/catch (added in 2.2 review fixes). This catch currently uses `console.error` — it will be updated to use the `onError` callback in this story.
- **Verify no regressions:** The test suite must pass completely before and after changes.

### Files to Create

| File | Purpose |
|------|---------|
| `packages/client/src/hooks/useToast.ts` | Toast state management hook |
| `packages/client/src/hooks/useToast.test.ts` | useToast hook tests |
| `packages/client/src/components/Toast.tsx` | Toast notification component |
| `packages/client/src/components/Toast.test.tsx` | Toast component tests |

### Files to Modify

| File | Change |
|------|--------|
| `packages/client/src/App.css` | Add animation keyframes and theme entries |
| `packages/client/src/hooks/useTodos.ts` | Add `onError` callback parameter, replace `console.error` calls |
| `packages/client/src/hooks/useTodos.test.ts` | Add error callback tests |
| `packages/client/src/App.tsx` | Wire `useToast` + `Toast` component |
| `packages/client/src/App.test.tsx` | Update for toast integration |

### Project Structure Notes

After this story, the component structure matches the architecture specification:

```
packages/client/src/
  components/
    AppShell.tsx          ← exists
    TodoInput.tsx         ← exists
    TodoItem.tsx          ← exists
    TodoList.tsx          ← exists
    Toast.tsx             ← NEW (this story)
    EmptyState.tsx        ← exists
    LoadingIndicator.tsx  ← exists
  hooks/
    useTodos.ts           ← MODIFIED (this story)
    useToast.ts           ← NEW (this story)
  api/
    todoApi.ts            ← unchanged
```

All 7 components from the architecture spec will exist after this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture, Error Handling (Frontend)]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR5 (Toast), UX-DR14 (Single Error Channel)]
- [Source: _bmad-output/planning-artifacts/prd.md — FR14-FR18, NFR12-NFR13]
- [Source: _bmad-output/implementation-artifacts/2-2-delete-todo-full-stack.md — Review Findings]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### Change Log

### File List
