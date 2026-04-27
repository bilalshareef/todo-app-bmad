# Story 1.5: App Shell & Layout

Status: done

## Story

As a user,
I want a clean, centered layout with a title and input field prominently displayed,
So that I can immediately see what the app does and start using it.

## Acceptance Criteria

1. **Given** the app is loaded **When** the page renders **Then** the AppShell component provides a centered layout with max-width 640px (`mx-auto`)
2. **And** the title "Todos" is displayed at 24px/1.5rem, semi-bold (600), color #111827
3. **And** container padding is 16px on mobile, 24px on desktop (md: breakpoint at 768px)
4. **And** the background is white, layout is full-height
5. **And** the TodoInput component renders with: 48px height, rounded-lg corners, #F9FAFB background, #E5E7EB border, placeholder "What needs to be done?"
6. **And** the input has a blue focus ring (ring-2 ring-blue-500) when focused
7. **And** the input has `aria-label="Add a new task"`
8. **And** the input is auto-focused on app load
9. **And** the TodoList renders below the input with 24px spacing
10. **And** todo items have bottom borders (#F3F4F6) as dividers

## Tasks / Subtasks

- [x] Task 1: Create AppShell component (AC: #1, #2, #3, #4)
  - [x] Create `packages/client/src/components/AppShell.tsx`
  - [x] Accept `children: React.ReactNode` prop
  - [x] Render outer container: `min-h-screen bg-white`
  - [x] Render inner container: `max-w-[640px] mx-auto px-4 md:px-6 py-8`
  - [x] Render title: `<h1>` with "Todos", styled `text-2xl font-semibold text-near-black`
  - [x] Render children below title with `mt-6` spacing
- [x] Task 2: Update App.tsx to use AppShell (AC: #1, #2, #3, #4, #9)
  - [x] Replace current inline layout with `<AppShell>` wrapping content
  - [x] Remove: `bg-warm-gray`, `flex items-center justify-center`, `max-w-lg` wrapper divs
  - [x] Remove: old title "Todo App" and subtitle "Your task management companion"
  - [x] Structure: `<AppShell>` → `<TodoInput>` → `<div className="mt-6">` → `<TodoList>`
  - [x] The 24px gap between input and list = `mt-6` (1.5rem = 24px)
- [x] Task 3: Update TodoItem to add bottom border dividers (AC: #10)
  - [x] Add `border-b border-[#F3F4F6]` to each `<li>` element in TodoItem.tsx
  - [x] Alternative: use `divide-y divide-[#F3F4F6]` on the `<ul>` in TodoList.tsx (preferred — keeps TodoItem simple)
- [x] Task 4: Verify TodoInput styling matches AC (AC: #5, #6, #7, #8)
  - [x] TodoInput already has correct styling from Story 1.3 — **verify only, do not recreate**
  - [x] Confirm: `h-12` (48px), `rounded-lg`, `bg-warm-gray`, `border-border-gray`, `focus:ring-2 focus:ring-accent-blue`, placeholder, aria-label, autoFocus
  - [x] No changes expected — all already implemented
- [x] Task 5: Create AppShell tests (AC: #1, #2, #3, #4)
  - [x] Create `packages/client/src/components/AppShell.test.tsx`
  - [x] Test: renders "Todos" heading
  - [x] Test: renders children content
  - [x] Test: heading is an h1 element
- [x] Task 6: Update App.test.tsx if needed (AC: #1, #2)
  - [x] Ensure existing render test still passes with new AppShell wrapper
  - [x] Add test: "Todos" heading is visible after render
- [x] Task 7: Update existing component tests for regressions (AC: all)
  - [x] Run full test suite — all 34 tests pass
  - [x] Verify TodoList tests still work with divider styling
  - [x] Verify TodoItem tests still work with border addition

### Review Findings

- [x] [Review][Patch] Regression coverage does not verify the new shell contract or divider styling [packages/client/src/App.test.tsx:29]

## Dev Notes

### Architecture Compliance

- **Component structure:** AppShell is one of the 7 planned flat components in `src/components/` per architecture doc
- **No business logic in AppShell:** Pure layout component — receives children, renders shell
- **Tailwind utilities only:** No custom CSS classes, no CSS modules, no styled-components
- **Co-located tests:** `AppShell.test.tsx` next to `AppShell.tsx`

### Critical: Current App.tsx Must Be Refactored, Not Rebuilt

The current `App.tsx` has an incorrect layout from the scaffold that needs updating:

**Current (WRONG for this story):**
```tsx
<div className="min-h-screen bg-warm-gray flex items-center justify-center">
  <div className="w-full max-w-lg px-4">
    <h1 className="text-3xl font-semibold text-near-black text-center">Todo App</h1>
    <p className="mt-2 text-medium-gray text-center">Your task management companion</p>
```

**Target (CORRECT):**
```tsx
<AppShell>
  <TodoInput onSubmit={addTodo} />
  <div className="mt-6">
    <TodoList todos={todos} loading={loading} />
  </div>
</AppShell>
```

**Specific changes:**
- Background: `bg-warm-gray` → `bg-white` (per AC #4)
- Width: `max-w-lg` (512px) → `max-w-[640px]` (per AC #1)
- Title: "Todo App" → "Todos" (per AC #2)
- Title size: `text-3xl` (30px) → `text-2xl` (24px / 1.5rem) (per AC #2)
- Remove subtitle: "Your task management companion" is not in spec
- Remove vertical centering: `flex items-center justify-center` — content should start at top, not be vertically centered
- Padding: `px-4` → `px-4 md:px-6` (16px mobile, 24px desktop per AC #3)

### Divider Implementation — Use `divide-y` on TodoList

The cleanest approach for bottom borders is adding `divide-y divide-[#F3F4F6]` to the `<ul>` in `TodoList.tsx` rather than `border-b` on each `<li>` in `TodoItem.tsx`. This:
- Avoids a border after the last item
- Keeps TodoItem styling minimal
- Uses standard Tailwind pattern for list dividers

Update in `TodoList.tsx`:
```tsx
<ul aria-label="Todo list" className="divide-y divide-[#F3F4F6]">
```

### Tailwind Design Tokens Already Available

From `packages/client/src/App.css` `@theme` block:
- `text-near-black` → `#111827` ✓
- `bg-warm-gray` → `#F9FAFB` ✓ (used by TodoInput background)
- `border-border-gray` → `#E5E7EB` ✓
- `ring-accent-blue` → `#3B82F6` ✓
- `bg-white` → standard Tailwind (no custom token needed)

**Not in theme:** `#F3F4F6` for divider borders — use arbitrary value `divide-[#F3F4F6]`

### AppShell Component Design

```tsx
import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[640px] mx-auto px-4 md:px-6 py-8">
        <h1 className="text-2xl font-semibold text-near-black">Todos</h1>
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  )
}
```

### Existing Files to Modify (NOT Create)

| File | Action |
|------|--------|
| `packages/client/src/App.tsx` | Replace inline layout with `<AppShell>` wrapper |
| `packages/client/src/components/TodoList.tsx` | Add `divide-y divide-[#F3F4F6]` to `<ul>` |
| `packages/client/src/App.test.tsx` | Update for new layout structure |

### New Files to Create

| File | Purpose |
|------|---------|
| `packages/client/src/components/AppShell.tsx` | App shell layout component |
| `packages/client/src/components/AppShell.test.tsx` | AppShell component tests |

### Files That Should NOT Be Modified

| File | Reason |
|------|--------|
| `packages/client/src/components/TodoInput.tsx` | Already has correct styling from Story 1.3 — all AC #5-#8 met |
| `packages/client/src/components/EmptyState.tsx` | No changes needed |
| `packages/client/src/components/LoadingIndicator.tsx` | No changes needed |
| `packages/client/src/hooks/useTodos.ts` | No changes needed |
| `packages/client/src/api/todoApi.ts` | No changes needed |
| Any backend file | This is a frontend-only story |

### Testing Strategy

**New tests** (in `AppShell.test.tsx`):
- Use `createRoot` + `act` pattern (matches existing `App.test.tsx` pattern)
- Test that heading "Todos" renders as `<h1>`
- Test that children are rendered inside the shell

**Existing tests** — all 43 must pass:
- `App.test.tsx` — may need minor update if it asserts specific text like "Todo App"
- `TodoList.test.tsx` — should pass unchanged (divider is on `<ul>`, tests may not check className)
- `TodoInput.test.tsx` — no changes expected
- `TodoItem.test.tsx` — no changes expected

### Previous Story Intelligence

From Story 1.4 dev notes:
- Tests use `createRoot` + `act` pattern for component rendering
- `fetchTodos` is mocked in `App.test.tsx` via `jest.mock('./api/todoApi')`
- `todoApi` module mock must be present in any test that renders components using `useTodos`
- Tailwind tokens `text-completed-gray` and `text-near-black` are confirmed working
- All frontend tests mock fetch at module level, not with global fetch mocking

### Project Structure Notes

- AppShell.tsx fits into the flat `src/components/` directory — no new folders needed
- This completes the 7th planned component in the architecture (AppShell, TodoInput, TodoItem, TodoList, Toast, EmptyState, LoadingIndicator) — though Toast is deferred to Epic 3
- Title alignment: architecture says "Todos" title, current code says "Todo App" — story corrects this

## Dev Agent Record

### Implementation Plan

- Created AppShell as a pure layout component with min-h-screen bg-white, centered max-w-[640px] container, responsive padding (px-4 / md:px-6), and "Todos" h1 heading
- Refactored App.tsx to use AppShell wrapper, removing old scaffold layout (bg-warm-gray, vertical centering, "Todo App" title, subtitle)
- Used `divide-y divide-[#F3F4F6]` on TodoList's `<ul>` for clean item dividers (preferred over per-item border-b)
- Verified TodoInput already satisfies AC #5-#8 from Story 1.3 — no changes needed

### Debug Log

No issues encountered during implementation.

### Completion Notes

- All 7 tasks completed successfully
- All 34 tests pass (8 test suites), 0 failures
- ESLint clean — no errors
- 3 new AppShell tests + 1 new App test added
- TodoInput verified — all styling ACs already met from Story 1.3

## File List

| File | Action |
|------|--------|
| packages/client/src/components/AppShell.tsx | Created |
| packages/client/src/components/AppShell.test.tsx | Created |
| packages/client/src/App.tsx | Modified |
| packages/client/src/App.test.tsx | Modified |
| packages/client/src/components/TodoList.tsx | Modified |

## Change Log

- 2026-04-27: Implemented Story 1.5 — App Shell & Layout. Created AppShell component, refactored App.tsx layout, added dividers to TodoList, added 4 new tests. All 34 tests pass.

### References

- [Source: _bmad-output/planning-artifacts/epics.md - Story 1.5 section]
- [Source: _bmad-output/planning-artifacts/architecture.md - Frontend Architecture, Component Structure, Project Structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - UX-DR3 TodoInput, UX-DR8 AppShell]
- [Source: _bmad-output/planning-artifacts/prd.md - FR21 (input accessible from any state)]
- [Source: _bmad-output/implementation-artifacts/1-4-display-todos-full-stack.md - Previous story patterns, test patterns]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
