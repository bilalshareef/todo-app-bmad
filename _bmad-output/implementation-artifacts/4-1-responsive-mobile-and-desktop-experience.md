# Story 4.1: Responsive Mobile & Desktop Experience

Status: ready-for-dev

## Story

As a user,
I want the app to work seamlessly on my phone and desktop,
so that I can manage my tasks on any device without friction.

## Acceptance Criteria

1. **Given** the user opens the app on a mobile device (viewport 320px–767px) **When** the page renders **Then** container padding is 16px **And** all controls (input, checkboxes, delete buttons) have minimum 44x44px touch targets **And** the delete button (×) is always visible on each todo row (no hover-to-reveal) **And** no hover styles are applied on touch devices **And** no horizontal scrolling occurs at any viewport width down to 320px **And** the input field and primary actions are visible without scrolling on initial load

2. **Given** the user opens the app on a desktop (viewport 768px+) **When** the page renders **Then** container padding is 24px **And** content is centered at max-width 640px **And** todo row hover highlight (#F9FAFB) is active with `cursor: pointer` **And** delete button hover states (color to #EF4444, background to #FEE2E2) are active

3. **Given** hover styles are defined **When** the CSS is evaluated **Then** all hover effects are scoped inside `@media (hover: hover)` to prevent sticky hover on touch devices

4. **Given** the user performs any CRUD action on mobile **When** they create, complete, or delete a todo **Then** the action works identically to desktop — same API calls, same state updates, same feedback

## Current State Analysis

**CRITICAL: Most responsive foundations are already in place.** The dev agent MUST carefully audit the current code before making changes to avoid regressions.

### Already Working (DO NOT BREAK)

| AC | Behavior | Implementation Location |
|----|----------|------------------------|
| AC #1 | Container padding 16px on mobile | `AppShell.tsx` — `px-4` (16px) |
| AC #1 | No hover styles on touch devices | `TodoItem.tsx` — `[@media(hover:hover)]` prefix on all hover classes |
| AC #1 | Input 48px height (exceeds 44px min) | `TodoInput.tsx` — `h-12` |
| AC #2 | Container padding 24px on desktop | `AppShell.tsx` — `md:px-6` (24px) |
| AC #2 | Content centered at max-width 640px | `AppShell.tsx` — `max-w-[640px] mx-auto` |
| AC #2 | Row hover highlight scoped | `TodoItem.tsx` — `[@media(hover:hover)]:hover:bg-warm-gray` |
| AC #2 | Delete hover states scoped | `TodoItem.tsx` — `[@media(hover:hover)]:hover:text-[#EF4444]` etc. |
| AC #3 | All hover effects scoped | `TodoItem.tsx` — all hover uses `[@media(hover:hover)]` prefix |
| AC #4 | CRUD identical on mobile/desktop | `useTodos.ts`, `todoApi.ts` — device-agnostic hooks/API |
| N/A | Viewport meta tag set | `index.html` — `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` |

### Needs Implementation

| AC | What's Missing | Current Behavior |
|----|----------------|-----------------|
| AC #1 | Delete button 44x44px touch target | `TodoItem.tsx` — delete button is `w-8 h-8` (32px), below 44px minimum |
| AC #1 | Todo row minimum height for touch targets | `TodoItem.tsx` — `<li>` has no explicit min-height; should be min 48px |
| AC #1 | Delete button always visible on mobile only | `TodoItem.tsx` — delete button is always visible on ALL viewports (should be hover-reveal on desktop per UX-DR9) |
| AC #1 | No horizontal scroll at 320px | No `overflow-hidden` or `break-words` protection on todo text for very long words |
| AC #2 | Delete button hover-reveal on desktop | `TodoItem.tsx` — delete button is always visible; should be hidden by default on desktop, revealed on row hover |

## Tasks / Subtasks

- [ ] Task 1: Update TodoItem delete button touch target to 44x44px (AC: #1)
  - [ ] 1.1: In `packages/client/src/components/TodoItem.tsx`, change the delete button from `w-8 h-8` to `w-11 h-11` (44px × 44px) to meet the minimum touch target requirement
  - [ ] 1.2: The `×` character and `flex items-center justify-center` already center the content — no visual change needed beyond the size increase

- [ ] Task 2: Add hover-reveal for delete button on desktop (AC: #1, #2)
  - [ ] 2.1: Add `group` class to the `<li>` element in `TodoItem.tsx`
  - [ ] 2.2: Add hover-reveal classes to the delete button: `[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100`
  - [ ] 2.3: Add keyboard focus visibility: `focus-visible:opacity-100` on the delete button so it remains accessible via keyboard on desktop
  - [ ] 2.4: On mobile (no hover capability), the button stays at default `opacity: 1` (always visible) since the `[@media(hover:hover)]` scoping means the `opacity-0` only applies on hover-capable devices

- [ ] Task 3: Add todo row minimum height for touch targets (AC: #1)
  - [ ] 3.1: Add `min-h-12` (48px) to the `<li>` element in `TodoItem.tsx`
  - [ ] 3.2: Add `items-center` to ensure vertical centering within the minimum height (already present on the `<li>`)

- [ ] Task 4: Prevent horizontal overflow at narrow viewports (AC: #1)
  - [ ] 4.1: Add `min-w-0` to the toggle button in `TodoItem.tsx` to allow flex child text truncation
  - [ ] 4.2: Add `break-words` (or `overflow-wrap: break-word`) to the todo text `<span>` to handle very long unbroken strings
  - [ ] 4.3: Optionally add `overflow-hidden` to the `<li>` as a safety net

- [ ] Task 5: Add transition to delete button opacity for smooth reveal (AC: #2)
  - [ ] 5.1: Add `transition-opacity` alongside the existing `transition-colors` on the delete button — or consolidate to `transition-all duration-150`
  - [ ] 5.2: The 150ms duration matches existing transitions per UX-DR13

- [ ] Task 6: Update TodoItem tests for responsive behavior (AC: #1, #2)
  - [ ] 6.1: Update `packages/client/src/components/TodoItem.test.tsx`
  - [ ] 6.2: Test: delete button renders with `w-11 h-11` classes (44px touch target)
  - [ ] 6.3: Test: `<li>` has `min-h-12` class
  - [ ] 6.4: Test: `<li>` has `group` class
  - [ ] 6.5: Test: delete button has opacity classes for hover-reveal on desktop (`[@media(hover:hover)]:opacity-0`, `[@media(hover:hover)]:group-hover:opacity-100`)
  - [ ] 6.6: Test: delete button has `focus-visible:opacity-100` for keyboard accessibility
  - [ ] 6.7: Verify existing tests still pass (stopPropagation, toggle, delete behavior)

- [ ] Task 7: Run full test suite and verify no regressions (AC: all)
  - [ ] 7.1: `cd packages/client && npx jest --coverage`
  - [ ] 7.2: All existing tests pass
  - [ ] 7.3: All new/updated tests pass
  - [ ] 7.4: No TypeScript errors (`npx tsc --noEmit`)

## Dev Notes

### Architecture Compliance

- **Tailwind utilities only:** All styling changes use Tailwind utility classes. No custom CSS classes, no CSS modules, no styled-components.
- **No new design tokens needed:** All colors and values already defined in `App.css` `@theme` block.
- **Component structure unchanged:** No new components needed. All changes are within existing `TodoItem.tsx`.
- **Co-located tests:** Test updates go in `TodoItem.test.tsx` next to the source file.
- **No hook changes:** `useTodos.ts` and `useToast.ts` are device-agnostic and require zero changes.
- **No API changes:** All backend code is unaffected.

### Critical Pattern: @media(hover:hover) Scoping

The project already uses the `[@media(hover:hover)]` Tailwind arbitrary variant to scope hover styles. This is the correct pattern per UX-DR9 to prevent sticky hover on touch devices. The new opacity-based hover-reveal MUST follow this same pattern:

```
[@media(hover:hover)]:opacity-0          — hide on hover-capable devices by default
[@media(hover:hover)]:group-hover:opacity-100  — show on row hover
focus-visible:opacity-100                — always show when keyboard-focused
```

On touch devices without hover capability, these rules don't apply, so the button remains at default `opacity: 1` (always visible).

### Critical Pattern: Tailwind Group Hover

Tailwind's `group` / `group-hover` pattern enables parent-triggered hover effects. The `<li>` gets the `group` class, and descendant elements can use `group-hover:` to respond when the `<li>` is hovered.

### Touch Target Sizes

Per WCAG 2.1 Success Criterion 2.5.5 (Target Size) and UX-DR9:
- **Minimum:** 44x44px for all interactive elements on touch devices
- **Current gaps:** Delete button is 32x32px (w-8 h-8) → must become 44x44px (w-11 h-11)
- **Already compliant:** TodoInput at 48px height, toggle button fills the row width

### TodoItem.tsx — Target Implementation

Current `<li>` and delete button:
```tsx
<li className="flex items-center">
  ...
  <button
    className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#D1D5DB] rounded transition-colors duration-150 [@media(hover:hover)]:hover:text-[#EF4444] [@media(hover:hover)]:hover:bg-[#FEE2E2]"
  >
```

Target `<li>` and delete button:
```tsx
<li className="group flex items-center min-h-12">
  ...
  <button
    className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-[#D1D5DB] rounded transition-all duration-150 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:hover)]:hover:text-[#EF4444] [@media(hover:hover)]:hover:bg-[#FEE2E2]"
  >
```

Target toggle button text span (add word break):
```tsx
<span className={`break-words min-w-0 transition-colors duration-150 ${...}`}>
```

Target toggle button (add min-w-0):
```tsx
<button
  className="flex-1 min-w-0 flex items-center gap-3 py-3 px-4 text-left font-sans cursor-pointer transition-colors duration-150 [@media(hover:hover)]:hover:bg-warm-gray"
>
```

### Project Structure Notes

- All changes are confined to `packages/client/src/components/TodoItem.tsx` and `packages/client/src/components/TodoItem.test.tsx`
- No new files needed
- No changes to `App.css`, `AppShell.tsx`, `TodoInput.tsx`, `TodoList.tsx`, or any other components
- No backend changes whatsoever

### Previous Story Learnings

From Story 3.2 (most recent):
- The `pendingToggleIds` guard prevents duplicate rapid toggles — do not interfere with this
- Optimistic UI patterns are in `useTodos.ts` — responsive changes should NOT touch hooks
- Server tests have a pre-existing Prisma ESM import issue — client tests are the validation gate
- Tests use `@testing-library/react` with `renderHook` for hooks and standard `render` for components

From Story 3.1:
- Toast animations are defined in `App.css` `@theme` block — this is the pattern for custom animations
- Design tokens are in `App.css` `@theme` block — use existing tokens, don't create new ones
- Co-located test files next to source files — follow this pattern

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 4, Story 4.1]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR4, UX-DR9, UX-DR13]
- [Source: _bmad-output/planning-artifacts/architecture.md — Implementation Patterns, Component Structure]
- [Source: _bmad-output/planning-artifacts/prd.md — FR22, FR23, FR24, NFR14-17]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
