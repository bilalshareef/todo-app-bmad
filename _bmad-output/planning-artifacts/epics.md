---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# todo-app-bmad - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for todo-app-bmad, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can create a new todo by entering text and submitting (via enter key)
FR2: User can see the newly created todo appear in the list immediately after submission
FR3: System stores creation timestamp as metadata when a todo is created
FR4: User can view all existing todos in a list upon opening the application
FR5: User can distinguish between active and completed todos through visual differentiation
FR6: User can see todo text and completion status for each item in the list
FR7: User can mark an active todo as complete with a single action (checkbox)
FR8: User can see the visual state of a todo update immediately upon completion
FR9: User can delete any todo (active or completed) with a single action
FR10: User can see the deleted todo removed from the list immediately
FR11: System persists all todos to backend storage so they survive page refreshes
FR12: System persists all todos to backend storage so they survive browser session changes
FR13: System retrieves and displays all persisted todos when the application loads
FR14: User receives a toast notification when a create operation fails
FR15: User receives a toast notification when a complete operation fails
FR16: User receives a toast notification when a delete operation fails
FR17: User receives a toast notification when data retrieval fails on load
FR18: System does not display a todo in the list unless it has been successfully persisted (no false persistence)
FR19: User sees a loading indicator while todos are being fetched from the backend
FR20: User sees a friendly empty state with a prompt to add tasks when no todos exist
FR21: User can access the text input to create a new todo from any application state (loading complete, empty, or populated)
FR22: User can perform all task actions (create, complete, delete) on mobile devices
FR23: User can perform all task actions (create, complete, delete) on desktop devices
FR24: User can interact with all controls using touch targets of adequate size on mobile

### NonFunctional Requirements

NFR1: All CRUD operations complete within 300ms under normal network conditions
NFR2: First contentful paint completes in under 1 second on standard broadband
NFR3: Time to interactive under 1.5 seconds on initial load
NFR4: UI updates render within 100ms of user action
NFR5: Initial JavaScript bundle size does not exceed 200KB gzipped
NFR6: API accepts only well-formed JSON requests and rejects malformed input with appropriate error codes
NFR7: API inputs are validated and sanitized server-side to prevent injection attacks
NFR8: API responses do not expose internal system details (stack traces, database errors)
NFR9: Architecture supports adding authentication and authorization without rewriting existing endpoints
NFR10: Every successful API write is durably persisted — no data loss between successful response and subsequent read
NFR11: API returns appropriate HTTP status codes for all success and failure scenarios
NFR12: Client-side error handling ensures no unhandled exceptions result in a blank screen or frozen UI
NFR13: Failed operations do not corrupt existing data or application state
NFR14: All interactive elements are keyboard accessible (tab navigation, enter to submit)
NFR15: Form inputs and interactive controls have associated labels readable by screen readers
NFR16: Text and interactive elements maintain sufficient color contrast (WCAG AA minimum: 4.5:1)
NFR17: Focus indicators are visible on all interactive elements during keyboard navigation

### Additional Requirements

- Starter template: Manual monorepo + create-vite scaffold — npm workspaces with `packages/client` and `packages/server`
- Initialization commands: `npm create vite@latest packages/client -- --template react-ts`, manual Fastify TypeScript setup for backend
- Database: PostgreSQL with Prisma ORM; migration via `prisma migrate dev` (development) and `prisma migrate deploy` (production)
- Data model: Single `Todo` model — id (UUID), text (String), completed (Boolean, default false), createdAt (DateTime), updatedAt (DateTime)
- API endpoints: REST under `/api` prefix — GET/POST `/api/todos`, PATCH/DELETE `/api/todos/:id`
- Response format: Envelope pattern `{ data: ... }` for success, Fastify default error format for errors
- Backend framework: Fastify with built-in JSON Schema validation on all route inputs
- Auth-ready structure: All routes under `/api` plugin encapsulation; single `preHandler` hook addition enables auth later
- Security middleware: `@fastify/cors` (frontend origin), `@fastify/helmet` (security headers)
- Frontend framework: React 19 + Vite 9, `useState`/`useContext` for state, `useTodos` custom hook for API + optimistic updates + rollback
- Component structure: 7 flat components — AppShell, TodoInput, TodoItem, TodoList, Toast, EmptyState, LoadingIndicator
- HTTP client: Native `fetch` API wrapped in `todoApi.ts` service layer — no axios
- Styling: Tailwind CSS v4 via `@tailwindcss/vite` plugin, CSS-first configuration
- Testing: Jest with `ts-jest`, co-located test files (`.test.ts`/`.test.tsx` next to source)
- Code quality: ESLint + Prettier
- Containerization: Docker multi-stage builds for production, Docker Compose for local dev (PostgreSQL + backend)
- Frontend hosting: AWS S3 + CloudFront (static assets)
- Backend hosting: AWS ECS Fargate with ALB routing `/api/*`
- Database hosting: AWS RDS PostgreSQL in private subnet
- CI/CD: GitHub Actions — lint → test → build → deploy on push to `main`
- Monitoring: Pino structured JSON logs → stdout → CloudWatch Logs; health check at GET `/health` → `{ status: "ok" }`
- Architecture pattern: Routes → Services → Prisma layering; thin route handlers, business logic in services
- Environment config: `.env` files locally (`.env.example` committed), AWS Secrets Manager for production secrets
- API documentation: `@fastify/swagger` + `@fastify/swagger-ui` auto-generated at `/docs` (development only)
- Naming conventions: PascalCase React components, camelCase functions/variables, UPPER_SNAKE_CASE constants, camelCase JSON fields
- Error handling (backend): JSON Schema rejects bad input (400), service-level Prisma error mapping, global `setErrorHandler` for unhandled errors
- Error handling (frontend): All API calls through `todoApi.ts`, errors caught in hooks, toast as single error channel, no try/catch in components
- Optimistic update pattern: Apply state change → fire API → on success keep state → on failure revert + toast
- Special create behavior: Cache input text, clear field, restore text on API failure

### UX Design Requirements

UX-DR1: Implement Inter font from Google Fonts as the app typeface (600 semi-bold for title, 400 regular for body, 500 medium for toasts)
UX-DR2: Implement color system — white (#FFFFFF) background, warm gray (#F9FAFB) surfaces, near-black (#111827) primary text, medium gray (#6B7280) secondary text, light gray (#9CA3AF) completed text, soft gray (#E5E7EB) borders, blue (#3B82F6) accent, muted green (#10B981) success flash, warm red (#EF4444) error, dark (#1F2937) toast background
UX-DR3: Implement TodoInput — 48px height, rounded-lg corners, #F9FAFB background, #E5E7EB border, blue focus ring (ring-2 ring-blue-500), placeholder "What needs to be done?", aria-label="Add a new task", auto-focus on load, enter-to-submit, cached text restore on API failure, silent empty rejection
UX-DR4: Implement TodoItem — full-row click to toggle completion (entire row clickable), circle checkbox (20px diameter, #D1D5DB border, #3B82F6 fill with white checkmark on completion), completed state: #9CA3AF text with line-through, delete button (×, 32px hit area, #D1D5DB default → #EF4444 hover, transparent → #FEE2E2 hover background) with stopPropagation, row hover highlight to #F9FAFB with cursor:pointer, min-height 48px, bottom border #F3F4F6
UX-DR5: Implement Toast — fixed bottom-right positioning, #1F2937 background, white text, #EF4444 accent icon (⚠️), max-width 360px, padding 14px 20px, border-radius 8px, slide-in from bottom (0.3s ease) entry, fade-out (0.3s ease) exit, 4-second auto-dismiss, role="alert" aria-live="polite", newest toast replaces current (no stacking), 14px medium weight text
UX-DR6: Implement EmptyState — ✨ emoji at 40px + text "All caught up! Add a task to get started." at 16px in #9CA3AF, centered within list area, 48px vertical padding
UX-DR7: Implement LoadingIndicator — subtle animated element (pulsing dots or small spinner), 24px height, centered below input field, does NOT block input, displayed only during initial GET /api/todos fetch, aria-live="polite" region
UX-DR8: Implement AppShell — max-width 640px centered (mx-auto), title "Todos" (24px/1.5rem semi-bold #111827), responsive padding: 16px mobile / 24px desktop, white background, full-height
UX-DR9: Implement responsive behavior — mobile-first with single md:768px breakpoint, delete button always visible on mobile (hover-reveal on desktop only), hover states scoped to @media (hover: hover), no layout reflow across breakpoints, touch targets minimum 44x44px
UX-DR10: Implement keyboard navigation — tab order: input → (checkbox → delete) per row, auto-focus input on app load, focus returns to input after adding todo, focus moves to next todo item after deleting (or to input if list empty)
UX-DR11: Implement screen reader support — input aria-label="Add a new task", ul aria-label="Todo list", checkbox with label containing todo text, delete button aria-label="Delete task: {todo text}", toast role="alert" aria-live="polite", loading region aria-live="polite"
UX-DR12: Implement visible focus indicators — ring-2 ring-blue-500 ring-offset-2 on all interactive elements during keyboard navigation
UX-DR13: Implement state transitions — 150ms CSS transitions on checkbox fill, hover background, delete button color; fade-in (150ms opacity) for loading→populated and loading→empty; no exit animation on item delete (instant removal); toast slide-in 0.3s, fade-out 0.3s
UX-DR14: Implement single error feedback channel — toast notifications only for errors, no success toasts, no inline error displays, no modals; silent empty input rejection (no visual feedback); conversational tone in error messages

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Create todo via text input + enter key |
| FR2 | Epic 1 | New todo appears in list immediately |
| FR3 | Epic 1 | Creation timestamp stored as metadata |
| FR4 | Epic 1 | View all todos on app load |
| FR5 | Epic 1 | Visual differentiation active vs. completed |
| FR6 | Epic 1 | Todo text and completion status visible |
| FR7 | Epic 2 | Mark todo complete with single action |
| FR8 | Epic 2 | Visual state updates immediately on completion |
| FR9 | Epic 2 | Delete any todo with single action |
| FR10 | Epic 2 | Deleted todo removed from list immediately |
| FR11 | Epic 1 | Todos persist across page refreshes |
| FR12 | Epic 1 | Todos persist across browser sessions |
| FR13 | Epic 1 | Persisted todos displayed on app load |
| FR14 | Epic 3 | Toast on create failure |
| FR15 | Epic 3 | Toast on complete failure |
| FR16 | Epic 3 | Toast on delete failure |
| FR17 | Epic 3 | Toast on load failure |
| FR18 | Epic 3 | No false persistence |
| FR19 | Epic 1 | Loading indicator during fetch |
| FR20 | Epic 1 | Friendly empty state |
| FR21 | Epic 1 | Input accessible from any state |
| FR22 | Epic 4 | All actions work on mobile |
| FR23 | Epic 4 | All actions work on desktop |
| FR24 | Epic 4 | Adequate touch targets on mobile |

## Epic List

### Epic 1: Project Foundation & Core Task Management
Users can open the app, create todos, view them in a list, and have them persist across sessions. This is the fundamental "type it, hit enter, it's there" loop — the entire product value proposition in one epic.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR11, FR12, FR13, FR19, FR20, FR21

### Epic 2: Task Lifecycle — Complete & Delete
Users can mark todos as complete (with visual distinction and satisfaction) and delete todos. Optimistic UI with rollback on both operations.
**FRs covered:** FR7, FR8, FR9, FR10

### Epic 3: Error Handling & Resilience
Users receive clear, friendly feedback when things go wrong — no silent failures, no false persistence. Toast notification system for all error states.
**FRs covered:** FR14, FR15, FR16, FR17, FR18

### Epic 4: Responsive Design & Accessibility
Users can use the app seamlessly on any device with full keyboard and screen reader support.
**FRs covered:** FR22, FR23, FR24

## Epic 1: Project Foundation & Core Task Management

Users can open the app, create todos, view them in a list, and have them persist across sessions. This is the fundamental "type it, hit enter, it's there" loop — the entire product value proposition in one epic.

### Story 1.1: Project Scaffold & Monorepo Setup

As a developer,
I want a fully initialized monorepo with frontend and backend packages, tooling, and local dev environment,
So that I can begin building features on a solid foundation.

**Acceptance Criteria:**

**Given** the project is being initialized for the first time
**When** the developer runs the setup commands
**Then** a monorepo exists with `packages/client` (React + Vite + TypeScript) and `packages/server` (Fastify + TypeScript) using npm workspaces
**And** Tailwind CSS v4 is configured via `@tailwindcss/vite` plugin with Inter font from Google Fonts
**And** design tokens are configured in Tailwind: color palette (#FFFFFF, #F9FAFB, #111827, #6B7280, #9CA3AF, #E5E7EB, #3B82F6, #10B981, #EF4444, #1F2937), typography (Inter), spacing rhythm
**And** ESLint and Prettier are configured with shared rules
**And** Jest with ts-jest is configured for both packages with co-located test file convention
**And** `tsconfig.base.json` exists with shared TypeScript config, extended by each package
**And** `.env.example` is committed with documented environment variables
**And** `.gitignore` properly excludes node_modules, .env, dist, and build artifacts
**And** `npm install` from the root installs all workspace dependencies
**And** the Vite dev server starts and renders a placeholder page
**And** the Fastify server starts and responds to `GET /health` with `{ status: "ok" }`

### Story 1.2: Database Setup & API Foundation

As a developer,
I want a PostgreSQL database with the Todo model and a running Fastify API with core plugins,
So that the backend is ready to serve todo data.

**Acceptance Criteria:**

**Given** the monorepo from Story 1.1 exists
**When** Docker Compose is started
**Then** a PostgreSQL container is running and accessible from the backend
**And** `prisma/schema.prisma` defines the Todo model with fields: id (UUID, default), text (String), completed (Boolean, default false), createdAt (DateTime, default now), updatedAt (DateTime, auto-updated)
**And** `prisma migrate dev` creates the database tables successfully
**And** a Prisma client plugin (`plugins/prisma.ts`) decorates the Fastify instance with the Prisma client
**And** `@fastify/cors` is configured for the frontend origin
**And** `@fastify/helmet` is registered for security headers
**And** `@fastify/swagger` and `@fastify/swagger-ui` are configured and available at `/docs` in development
**And** all todo routes are registered under the `/api` prefix using Fastify plugin encapsulation
**And** the global `setErrorHandler` catches unhandled errors, logs via Pino, and returns generic 500 with no internal details

### Story 1.3: Create Todo — Full Stack

As a user,
I want to type a task and press enter to add it to my list,
So that I can capture what I need to do instantly.

**Acceptance Criteria:**

**Given** the app is loaded in the browser
**When** the user types text into the input field and presses Enter
**Then** a POST request is sent to `/api/todos` with `{ text: "user's text" }`
**And** the API validates the request body with JSON Schema (requires non-empty `text` string)
**And** the API creates a Todo record via `todoService.createTodo()` and returns `{ data: Todo }` with 201 status
**And** the new todo appears in the list immediately after successful API response
**And** the input field clears after submission
**And** the creation timestamp is stored as metadata (createdAt)

**Given** the user submits an empty input
**When** Enter is pressed with no text (or whitespace only)
**Then** nothing happens — silent rejection, no API call, no error message

**Given** the API receives a malformed or empty request body
**When** JSON Schema validation fails
**Then** the API returns 400 with Fastify's default error format and no internal details

### Story 1.4: Display Todos — Full Stack

As a user,
I want to see all my todos when I open the app,
So that I can review what I need to do.

**Acceptance Criteria:**

**Given** the user opens the application
**When** the app loads
**Then** a GET request is sent to `/api/todos`
**And** the API retrieves all todos via `todoService.getAllTodos()` and returns `{ data: Todo[] }`
**And** the todo list renders showing text and completion status for each item
**And** active todos display with dark text (#111827)
**And** completed todos display with light gray text (#9CA3AF) and strikethrough
**And** a loading indicator (24px, centered, pulsing/spinner) is shown below the input while the GET request is in progress
**And** the input field remains accessible and usable during loading (not blocked)
**And** the loading indicator disappears when data loads successfully

**Given** no todos exist in the database
**When** the app loads and receives an empty array
**Then** the empty state is shown: ✨ emoji (40px) + "All caught up! Add a task to get started." (16px, #9CA3AF), centered with 48px vertical padding
**And** the input field remains visible and ready for use

### Story 1.5: App Shell & Layout

As a user,
I want a clean, centered layout with a title and input field prominently displayed,
So that I can immediately see what the app does and start using it.

**Acceptance Criteria:**

**Given** the app is loaded
**When** the page renders
**Then** the AppShell component provides a centered layout with max-width 640px (`mx-auto`)
**And** the title "Todos" is displayed at 24px/1.5rem, semi-bold (600), color #111827
**And** container padding is 16px on mobile, 24px on desktop (md: breakpoint at 768px)
**And** the background is white, layout is full-height
**And** the TodoInput component renders with: 48px height, rounded-lg corners, #F9FAFB background, #E5E7EB border, placeholder "What needs to be done?"
**And** the input has a blue focus ring (ring-2 ring-blue-500) when focused
**And** the input has `aria-label="Add a new task"`
**And** the input is auto-focused on app load
**And** the TodoList renders below the input with 24px spacing
**And** todo items have bottom borders (#F3F4F6) as dividers

## Epic 2: Task Lifecycle — Complete & Delete

Users can mark todos as complete (with visual distinction and satisfaction) and delete todos. Optimistic UI with rollback on both operations.

### Story 2.1: Complete Todo — Full Stack

As a user,
I want to mark a todo as complete by clicking anywhere on the row,
So that I get a satisfying sense of progress as I finish tasks.

**Acceptance Criteria:**

**Given** the user has active todos in the list
**When** the user clicks anywhere on a todo row (or taps on mobile)
**Then** a PATCH request is sent to `/api/todos/:id` with `{ completed: true }`
**And** the API validates the request with JSON Schema (requires boolean `completed` field)
**And** the API updates the todo via `todoService.updateTodo()` and returns `{ data: Todo }`
**And** the checkbox fills with blue (#3B82F6) and shows a white checkmark with a 150ms CSS transition
**And** the todo text changes to #9CA3AF with `line-through` text decoration
**And** the circle checkbox is 20px diameter with #D1D5DB border when unchecked

**Given** the user has a completed todo
**When** the user clicks the todo row again
**Then** a PATCH request is sent with `{ completed: false }`
**And** the checkbox empties, text color restores to #111827, and strikethrough is removed (150ms transition)

**Given** the row is hovered on desktop
**When** the mouse enters the todo row
**Then** the row background shifts to #F9FAFB with `cursor: pointer` (150ms transition)

### Story 2.2: Delete Todo — Full Stack

As a user,
I want to delete a todo with a single click on the delete button,
So that I can remove tasks I no longer need without any friction.

**Acceptance Criteria:**

**Given** the user has todos in the list
**When** the user clicks the delete button (×) on a todo item
**Then** a DELETE request is sent to `/api/todos/:id`
**And** the API deletes the todo via `todoService.deleteTodo()` and returns `{ data: { id: string } }`
**And** the todo is removed from the list instantly (no exit animation)
**And** the delete action does NOT trigger the row's completion toggle (`stopPropagation`)

**Given** the delete button is in its default state
**When** the user views the todo row
**Then** the × button is visible with a 32px hit area, color #D1D5DB, transparent background

**Given** the delete button is hovered on desktop
**When** the mouse enters the × button
**Then** the color changes to #EF4444 and background to #FEE2E2 (150ms transition)

**Given** the last todo is deleted
**When** the list becomes empty
**Then** the empty state is displayed (✨ "All caught up! Add a task to get started.")

## Epic 3: Error Handling & Resilience

Users receive clear, friendly feedback when things go wrong — no silent failures, no false persistence. Toast notification system for all error states.

### Story 3.1: Toast Notification System

As a user,
I want to see clear, friendly error messages when something goes wrong,
So that I know what happened and can take action to fix it.

**Acceptance Criteria:**

**Given** an error occurs in any operation
**When** the error is caught by the `useTodos` hook
**Then** a toast notification slides in from the bottom-right of the screen (0.3s ease animation)
**And** the toast has: dark background (#1F2937), white text, red accent icon (⚠️, #EF4444)
**And** the toast text is 14px, medium weight (500)
**And** the toast has max-width 360px, padding 14px 20px, border-radius 8px
**And** the toast has `role="alert"` and `aria-live="polite"` for screen reader announcement
**And** the toast auto-dismisses after 4 seconds with a fade-out (0.3s ease) animation
**And** if a new error occurs while a toast is visible, the new toast replaces the current one (no stacking)

**Given** no error has occurred
**When** a CRUD operation succeeds
**Then** no toast is shown — no success toasts, no inline feedback beyond the state change itself

### Story 3.2: Optimistic UI with Rollback & Error Recovery

As a user,
I want my actions to feel instant but honestly roll back if something fails,
So that I'm never left with a false impression of what's saved.

**Acceptance Criteria:**

**Given** the user creates a new todo
**When** the POST request fails (network error or API error)
**Then** the todo does NOT appear in the list (no false persistence — FR18)
**And** the cached input text is restored to the input field so the user can retry without retyping
**And** a toast appears: "Couldn't save your task — check your connection and try again"

**Given** the user toggles a todo's completion status
**When** the PATCH request fails
**Then** the checkbox and text styling revert to the previous state
**And** a toast appears: "Couldn't update — check your connection"

**Given** the user deletes a todo
**When** the DELETE request fails
**Then** the todo is restored to its position in the list
**And** a toast appears: "Couldn't delete — check your connection"

**Given** the app is loading todos on startup
**When** the GET request fails
**Then** a toast appears: "Couldn't load your tasks — check your connection"
**And** the list area shows empty (no stale data)
**And** the input field remains usable — the user can still attempt to add tasks

**Given** any API error occurs
**When** the error is processed
**Then** existing application state is not corrupted (NFR13)
**And** no unhandled exceptions cause a blank screen or frozen UI (NFR12)

## Epic 4: Responsive Design & Accessibility

Users can use the app seamlessly on any device with full keyboard and screen reader support.

### Story 4.1: Responsive Mobile & Desktop Experience

As a user,
I want the app to work seamlessly on my phone and desktop,
So that I can manage my tasks on any device without friction.

**Acceptance Criteria:**

**Given** the user opens the app on a mobile device (viewport 320px–767px)
**When** the page renders
**Then** container padding is 16px
**And** all controls (input, checkboxes, delete buttons) have minimum 44x44px touch targets
**And** the delete button (×) is always visible on each todo row (no hover-to-reveal)
**And** no hover styles are applied on touch devices
**And** no horizontal scrolling occurs at any viewport width down to 320px
**And** the input field and primary actions are visible without scrolling on initial load

**Given** the user opens the app on a desktop (viewport 768px+)
**When** the page renders
**Then** container padding is 24px
**And** content is centered at max-width 640px
**And** todo row hover highlight (#F9FAFB) is active with `cursor: pointer`
**And** delete button hover states (color to #EF4444, background to #FEE2E2) are active

**Given** hover styles are defined
**When** the CSS is evaluated
**Then** all hover effects are scoped inside `@media (hover: hover)` to prevent sticky hover on touch devices

**Given** the user performs any CRUD action on mobile
**When** they create, complete, or delete a todo
**Then** the action works identically to desktop — same API calls, same state updates, same feedback

### Story 4.2: Keyboard Navigation & Focus Management

As a user who navigates with a keyboard,
I want to perform all actions without a mouse,
So that the app is fully accessible via keyboard alone.

**Acceptance Criteria:**

**Given** the app loads
**When** the page finishes rendering
**Then** the input field receives focus automatically

**Given** the user presses Tab
**When** navigating through the interface
**Then** focus moves in order: input field → todo 1 checkbox → todo 1 delete → todo 2 checkbox → todo 2 delete → (continues per row)

**Given** focus is on the input field
**When** the user types text and presses Enter
**Then** the todo is created and focus returns to the input field

**Given** focus is on a checkbox
**When** the user presses Space
**Then** the todo's completion status toggles (standard checkbox behavior)

**Given** focus is on a delete button
**When** the user presses Enter
**Then** the todo is deleted
**And** focus moves to the next todo item's checkbox, or to the input field if the list is now empty

**Given** any interactive element has focus
**When** the user is navigating via keyboard
**Then** a visible focus ring is displayed: `ring-2 ring-blue-500 ring-offset-2`

### Story 4.3: Screen Reader Support

As a user who relies on a screen reader,
I want all elements to be properly announced,
So that I can fully understand and operate the app without visual cues.

**Acceptance Criteria:**

**Given** the input field receives focus
**When** the screen reader announces the element
**Then** it reads the `aria-label="Add a new task"`

**Given** the todo list is rendered
**When** the screen reader encounters the list
**Then** it identifies it as a list via `<ul>` with `aria-label="Todo list"`

**Given** a todo item is in the list
**When** the screen reader encounters the checkbox
**Then** it announces the todo text via the associated `<label>` (e.g., "Buy groceries, checkbox, not checked")

**Given** a delete button exists on a todo
**When** the screen reader encounters the button
**Then** it announces `aria-label="Delete task: Buy groceries"` (dynamic label includes todo text)

**Given** an error toast appears
**When** the toast is rendered with `role="alert"` and `aria-live="polite"`
**Then** the screen reader announces the error message automatically without requiring focus change

**Given** the app is in loading state
**When** todos are being fetched
**Then** the loading region with `aria-live="polite"` announces "Loading tasks"
**And** the announcement clears when loading completes

**Given** all text and interactive elements
**When** contrast ratios are measured
**Then** primary text (#111827 on #FFFFFF) meets 15.4:1 — passes WCAG AA
**And** secondary text (#6B7280 on #FFFFFF) meets 5.0:1 — passes WCAG AA
**And** placeholder text (#6B7280 on #F9FAFB) meets 4.7:1 — passes WCAG AA
**And** toast text (#FFFFFF on #1F2937) meets 14.5:1 — passes WCAG AA
