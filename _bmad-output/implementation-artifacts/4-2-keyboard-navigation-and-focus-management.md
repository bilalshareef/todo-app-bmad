# Story 4.2: Keyboard Navigation & Focus Management

Status: done

## Story

As a user who navigates with a keyboard,
I want to perform all actions without a mouse,
so that the app is fully accessible via keyboard alone.

## Acceptance Criteria

1. **Given** the app loads **When** the page finishes rendering **Then** the input field receives focus automatically

2. **Given** the user presses Tab **When** navigating through the interface **Then** focus moves in order: input field → todo 1 checkbox → todo 1 delete → todo 2 checkbox → todo 2 delete → (continues per row)

3. **Given** focus is on the input field **When** the user types text and presses Enter **Then** the todo is created and focus returns to the input field

4. **Given** focus is on a checkbox **When** the user presses Space **Then** the todo's completion status toggles (standard checkbox behavior)

5. **Given** focus is on a delete button **When** the user presses Enter **Then** the todo is deleted **And** focus moves to the next todo item's checkbox, or to the input field if the list is now empty

6. **Given** any interactive element has focus **When** the user is navigating via keyboard **Then** a visible focus ring is displayed: `ring-2 ring-blue-500 ring-offset-2`

## Current State Analysis

**CRITICAL: Several keyboard behaviors already work naturally. The dev agent MUST audit current code before making changes to avoid regressions.**

### Already Working (DO NOT BREAK)

| AC | Behavior | Implementation Location |
|----|----------|------------------------|
| AC #1 | Input auto-focused on load | `TodoInput.tsx` — `autoFocus` attribute on `<input>` |
| AC #2 | Tab order follows DOM order (input → checkbox → delete per row) | Natural DOM order — buttons are focusable by default. `TodoItem.tsx` renders checkbox button then delete button. `App.tsx` renders `TodoInput` before `TodoList` |
| AC #3 | Enter creates todo; focus stays on input | `TodoInput.tsx` — `onKeyDown` handler processes Enter. Input never loses focus since Enter doesn't blur |
| AC #4 | Space toggles checkbox | `TodoItem.tsx` — explicit `onKeyDown` handler for Space key with `preventDefault()` to prevent scroll |
| AC #5 | Enter on delete button triggers delete | Native `<button>` behavior — buttons respond to Enter key natively |
| N/A | `aria-label` on checkbox with todo text | `TodoItem.tsx` — `aria-label={todo.text}` |
| N/A | `aria-label` on delete button | `TodoItem.tsx` — `aria-label={`Delete task: ${todo.text}`}` |
| N/A | `role="checkbox"` + `aria-checked` | `TodoItem.tsx` — on the toggle button |
| N/A | `aria-label="Todo list"` on `<ul>` | `TodoList.tsx` — on the `<ul>` element |
| N/A | `aria-label="Add a new task"` on input | `TodoInput.tsx` — on the `<input>` element |
| N/A | Delete button keyboard-accessible despite hover-reveal | `TodoItem.tsx` — `focus-visible:pointer-events-auto focus-visible:opacity-100` |
| N/A | `pendingToggleIds` guard against rapid toggles | `useTodos.ts` — prevents duplicate Space key toggles |

### Needs Implementation

| AC | What's Missing | Current Behavior |
|----|----------------|-----------------|
| AC #5 | Focus moves to next todo's checkbox after delete | No focus management after delete — focus is lost to `<body>` when the focused button is removed from DOM |
| AC #5 | Focus moves to input if list becomes empty after delete | Same — no post-delete focus logic exists |
| AC #6 | Visible focus ring on checkbox/toggle button | `TodoItem.tsx` — no `focus-visible:ring-*` classes on the toggle button |
| AC #6 | Visible focus ring on delete button | `TodoItem.tsx` — no `focus-visible:ring-*` classes on the delete button |
| AC #6 | Consistent focus ring on input | `TodoInput.tsx` — uses `focus:ring-2 focus:ring-accent-blue` (not `focus-visible:`, no `ring-offset-2`). Should use `focus-visible:` to only show for keyboard users |

## Tasks / Subtasks

- [x] Task 1: Add visible focus ring to TodoInput (AC: #6)
  - [x] 1.1: In `packages/client/src/components/TodoInput.tsx`, change focus ring classes from `focus:ring-2 focus:ring-accent-blue focus:outline-none` to `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:outline-none`
  - [x] 1.2: Use literal `ring-blue-500` (not `ring-accent-blue`) to match the exact spec from UX-DR12 (`ring-2 ring-blue-500 ring-offset-2`)
  - [x] 1.3: Keep `focus:outline-none` to suppress the browser default outline (Tailwind `ring` replaces it)

- [x] Task 2: Add visible focus ring to TodoItem toggle button (AC: #6)
  - [x] 2.1: In `packages/client/src/components/TodoItem.tsx`, add `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:outline-none` to the toggle button's `className`
  - [x] 2.2: Also add `rounded-lg` to the toggle button to give the focus ring a reasonable shape (a fully rectangular ring around the full-width button looks correct with slight rounding)

- [x] Task 3: Add visible focus ring to TodoItem delete button (AC: #6)
  - [x] 3.1: In `packages/client/src/components/TodoItem.tsx`, add `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:outline-none` to the delete button's `className`
  - [x] 3.2: The delete button already has `rounded` which gives the focus ring a rounded shape — no additional border-radius needed

- [x] Task 4: Expose TodoInput ref for programmatic focus (AC: #5)
  - [x] 4.1: In `packages/client/src/components/TodoInput.tsx`, use `forwardRef` to expose the `<input>` element's ref
  - [x] 4.2: Import `forwardRef` from React: `import { useState, forwardRef, type KeyboardEvent } from 'react'`
  - [x] 4.3: Change component signature to: `export const TodoInput = forwardRef<HTMLInputElement, TodoInputProps>(function TodoInput({ onSubmit }, ref) { ... })`
  - [x] 4.4: Add `ref={ref}` to the `<input>` element
  - [x] 4.5: Keep all existing behavior (autoFocus, onKeyDown, aria-label) unchanged

- [x] Task 5: Add focus management after delete (AC: #5)
  - [x] 5.1: In `packages/client/src/components/TodoList.tsx`, add refs to track todo items for focus management
  - [x] 5.2: Create a `Map<string, HTMLElement>` ref using `useRef` to store references to each todo item's first focusable element (the checkbox/toggle button)
  - [x] 5.3: Pass a `registerRef` callback prop to `TodoItem` that each item calls to register its toggle button ref with its `todo.id`
  - [x] 5.4: Accept an `inputRef` prop of type `React.RefObject<HTMLInputElement | null>` on `TodoList` to focus the input when the list becomes empty
  - [x] 5.5: Wrap the `onDelete` callback to capture focus target BEFORE the delete happens:
    ```
    function handleDelete(id: string) {
      const currentIndex = todos.findIndex(t => t.id === id)
      // Determine next focus target: next item's checkbox, or previous, or input
      const nextId = currentIndex < todos.length - 1 ? todos[currentIndex + 1].id : undefined
      const prevId = currentIndex > 0 ? todos[currentIndex - 1].id : undefined
      
      onDelete(id)
      
      // After React re-renders, focus the target
      requestAnimationFrame(() => {
        if (nextId && itemRefs.current.get(nextId)) {
          itemRefs.current.get(nextId)?.focus()
        } else if (prevId && itemRefs.current.get(prevId)) {
          itemRefs.current.get(prevId)?.focus()
        } else {
          inputRef?.current?.focus()
        }
      })
    }
    ```
  - [x] 5.6: Clean up refs when items unmount (delete the entry from the Map when the ref callback receives null)

- [x] Task 6: Wire up refs in TodoItem (AC: #5)
  - [x] 6.1: In `packages/client/src/components/TodoItem.tsx`, accept an optional `registerRef` prop: `registerRef?: (id: string, el: HTMLButtonElement | null) => void`
  - [x] 6.2: Use a callback ref on the toggle button: `ref={(el) => registerRef?.(todo.id, el)}`
  - [x] 6.3: No changes needed to the delete button — focus management is handled by `TodoList`

- [x] Task 7: Wire up refs in App.tsx (AC: #5)
  - [x] 7.1: In `packages/client/src/App.tsx`, create an input ref: `const inputRef = useRef<HTMLInputElement>(null)`
  - [x] 7.2: Pass `ref={inputRef}` to `<TodoInput>`
  - [x] 7.3: Pass `inputRef={inputRef}` to `<TodoList>`

- [x] Task 8: Update TodoInput tests (AC: #6)
  - [x] 8.1: In `packages/client/src/components/TodoInput.test.tsx`, update test for focus ring: verify input has `focus-visible:ring-2`, `focus-visible:ring-blue-500`, `focus-visible:ring-offset-2` classes
  - [x] 8.2: Ensure `autoFocus` test still passes
  - [x] 8.3: Ensure Enter-to-submit and empty rejection tests still pass

- [x] Task 9: Update TodoItem tests (AC: #5, #6)
  - [x] 9.1: In `packages/client/src/components/TodoItem.test.tsx`, add test: toggle button has `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2` classes
  - [x] 9.2: Add test: delete button has `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2` classes
  - [x] 9.3: Add test: `registerRef` callback is called with `todo.id` and the toggle button element on mount
  - [x] 9.4: Ensure existing tests (Space toggle, Enter delete, stopPropagation, aria labels, hover-reveal) still pass

- [x] Task 10: Add focus management integration tests (AC: #5)
  - [x] 10.1: In `packages/client/src/App.test.tsx`, add test: after deleting a todo with keyboard (focus on delete button + Enter), focus moves to the next todo's toggle button
  - [x] 10.2: Add test: after deleting the last todo in the list, focus moves to the previous todo's toggle button
  - [x] 10.3: Add test: after deleting the only todo, focus moves to the input field
  - [x] 10.4: These tests need mock API responses — follow existing patterns in `App.test.tsx` using jest mocking of `todoApi`

- [x] Task 11: Run full test suite and verify no regressions (AC: all)
  - [x] 11.1: `cd packages/client && npx jest --coverage`
  - [x] 11.2: All existing tests pass
  - [x] 11.3: All new/updated tests pass
  - [x] 11.4: No TypeScript errors (`npx tsc --noEmit`)

### Review Findings

- [x] [Review][Patch] Prevent focus from moving when delete rolls back after an API failure [/Users/bilalshareef/Bilal/workspace/todo-app-bmad/packages/client/src/components/TodoList.tsx:26]
- [x] [Review][Patch] Cover the required keyboard delete path in the new focus-management integration tests [/Users/bilalshareef/Bilal/workspace/todo-app-bmad/packages/client/src/App.test.tsx:166]

## Dev Notes

### Architecture Compliance

- **Tailwind utilities only:** All styling changes use Tailwind utility classes. No custom CSS classes, no CSS modules, no styled-components.
- **No new design tokens needed:** `ring-blue-500` is a standard Tailwind utility using the default Tailwind blue-500 color, which matches `#3B82F6` (our accent-blue). No theme customization required.
- **Component structure:** No new components needed. All changes are within existing `TodoItem.tsx`, `TodoInput.tsx`, `TodoList.tsx`, and `App.tsx`.
- **Co-located tests:** Test updates go in co-located `.test.tsx` files next to source files.
- **No hook changes needed:** `useTodos.ts` delete flow works correctly — focus management is handled at the component level via refs, not in hooks.
- **No API or backend changes:** All changes are frontend-only.

### Critical Pattern: focus-visible vs focus

Use `focus-visible:` NOT `focus:` for focus ring styles. The `focus-visible` pseudo-class only activates during keyboard navigation, not on mouse clicks. This prevents distracting focus rings when users click interactive elements — a key accessibility UX pattern.

**Exception:** Keep `focus:outline-none` (not `focus-visible:outline-none`) to suppress the browser's default outline in ALL focus scenarios, since Tailwind's ring system replaces it.

```
Correct:  focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus:outline-none
Wrong:    focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none  (shows on click too)
```

### Critical Pattern: Post-Delete Focus Management

When a focused element is removed from the DOM (e.g., deleting a todo whose delete button has focus), the browser moves focus to `<body>`, leaving keyboard users stranded. The fix:

1. **Before delete:** Capture the index of the item being deleted and determine the focus target (next item, previous item, or input)
2. **After delete:** Use `requestAnimationFrame` to wait for React to re-render, then programmatically focus the target element
3. **Ref strategy:** Use a `Map<string, HTMLElement>` in `TodoList` keyed by `todo.id` to reference each item's toggle button. Pass a `registerRef` callback to `TodoItem`. On unmount, clean up the ref.

**Focus target priority after delete:**
1. Next todo's checkbox/toggle button (if exists)
2. Previous todo's checkbox/toggle button (if next doesn't exist — i.e., deleting the last item)
3. Input field (if list is now empty)

### Critical Pattern: forwardRef for TodoInput

`TodoInput` must expose its `<input>` element via `forwardRef` so that `App.tsx` can pass a ref to it, and `TodoList` can focus it when the list becomes empty after delete. This is the standard React pattern for imperative focus management.

```tsx
// Before:
export function TodoInput({ onSubmit }: TodoInputProps) { ... }

// After:
export const TodoInput = forwardRef<HTMLInputElement, TodoInputProps>(
  function TodoInput({ onSubmit }, ref) { ... }
)
```

### Critical Pattern: Tailwind ring-offset-2

`ring-offset-2` creates a 2px gap between the element and the focus ring, making the ring visually distinct from the element. This is specified in UX-DR12 and must be on ALL interactive elements:
- TodoInput `<input>`
- TodoItem toggle `<button>` (checkbox row)
- TodoItem delete `<button>` (×)

### TodoList Props Change

`TodoList` currently accepts: `{ todos, loading, onToggle, onDelete }`. It will gain one new prop:
- `inputRef: React.RefObject<HTMLInputElement | null>` — for focusing input when list empties after delete

### TodoItem Props Change

`TodoItem` currently accepts: `{ todo, onToggle, onDelete }`. It will gain one new optional prop:
- `registerRef?: (id: string, el: HTMLButtonElement | null) => void` — callback to register the toggle button ref

### Project Structure Notes

- All changes are in `packages/client/src/` only
- Files modified: `TodoItem.tsx`, `TodoInput.tsx`, `TodoList.tsx`, `App.tsx`
- Test files modified: `TodoItem.test.tsx`, `TodoInput.test.tsx`, `App.test.tsx`
- No new files needed
- No backend changes
- No `App.css` changes

### Previous Story (4.1) Learnings

From Story 4.1 (Responsive Mobile & Desktop Experience) — completed immediately before this story:
- **`[@media(hover:hover)]` scoping:** All hover effects use this Tailwind arbitrary variant. Do NOT interfere with this pattern when adding focus styles.
- **`group` / `group-hover` pattern:** The `<li>` has `group` class, delete button uses `group-hover:opacity-100`. Focus styles must coexist with this hover-reveal system — `focus-visible:opacity-100` already exists on the delete button.
- **Delete button is `w-11 h-11`** (44px touch target) — do not change this size.
- **`min-h-12`** on `<li>` for row height — do not remove.
- **`break-words min-w-0`** on text span for overflow protection — do not remove.
- **Tests use `@testing-library/react`** with standard `render` for components and `renderHook` for hooks.
- **Server tests have pre-existing Prisma ESM import issue** — client tests are the validation gate. Only run client tests.
- **102 tests currently pass** — the full client test suite must continue to pass after changes.

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR10, UX-DR12]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture, Component Structure, Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md — NFR14, NFR17]
- [Source: _bmad-output/implementation-artifacts/4-1-responsive-mobile-and-desktop-experience.md — Dev Notes, Completion Notes]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
No issues encountered during implementation.

### Completion Notes List
- All 6 acceptance criteria satisfied
- Focus rings (`focus-visible:ring-2 ring-blue-500 ring-offset-2`) added to input, toggle button, and delete button
- `TodoInput` converted to `forwardRef` for programmatic focus management
- Post-delete focus management implemented in `TodoList` using `Map<string, HTMLButtonElement>` ref strategy
- Focus priority after delete: next item → previous item → input field
- 8 new tests added (2 TodoInput, 3 TodoItem, 3 App integration), all 110 tests pass
- 0 TypeScript errors, 98.54% statement coverage

### Change Log
- 2026-04-28: Implemented keyboard navigation & focus management (Story 4.2) — all 11 tasks completed

### File List
- packages/client/src/components/TodoInput.tsx (modified)
- packages/client/src/components/TodoItem.tsx (modified)
- packages/client/src/components/TodoList.tsx (modified)
- packages/client/src/App.tsx (modified)
- packages/client/src/components/TodoInput.test.tsx (modified)
- packages/client/src/components/TodoItem.test.tsx (modified)
- packages/client/src/App.test.tsx (modified)
