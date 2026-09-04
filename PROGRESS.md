# requirements.txt — implementation progress

Working through `requirements.txt` one phase at a time to keep sessions small and cheap.
Update this file's checkboxes/status as work lands. Don't re-derive context that's already
recorded here — read this file first at the start of a new session.

## Phase 1 — Fix workspace switching (CRITICAL) — ✅ DONE (2026-09-04)

Root cause: `activeProject`/`activeBoard` were already correctly derived from
`activeWorkspaceId`, but three views read the **raw, unscoped** `projects`/`tickets`
arrays instead of workspace-filtered data:

- `Sidebar.tsx` — project nav list (`projects.map`) and the "My Tasks" badge count
  showed/counted every workspace's projects and tickets.
- `MyTasksView.tsx` — "My Tasks" page listed tickets assigned to the user across
  *all* workspaces, not just the active one.
- `CreateTicketModal.tsx` — the "Project" dropdown when creating a ticket let you
  pick a project from a different workspace than the one you're viewing.

Fix (in `src/context/AppContext.tsx`):
- Added derived, workspace-scoped selectors as the source of truth: `workspaceProjects`,
  `workspaceBoards`, `workspaceTickets` (all filtered from `activeWorkspace.id`).
- `activeProject` now only ever resolves from `workspaceProjects` (no cross-workspace fallback).
- `setActiveWorkspaceId` is now a wrapper (not the raw `useState` setter) that, on every
  switch, resets `activeProjectId`, closes any open ticket (`selectedTicketId`), clears
  multi-select, and resets `filters`/`searchQuery` — so no stale state or UI from the
  previous workspace can leak into the new one.
- Updated the three consumer components above to read `workspaceProjects`/`workspaceTickets`.
- `activeWorkspaceId` was already persisted to `localStorage` and restored on load, so
  refresh/deep-link behavior was already correct — no change needed there.

Also fixed a pre-existing unrelated type error in `src/data/seedData.ts` (a seeded comment
used `userId`/`userName`/`userAvatar` instead of the `Comment` type's `user: User` field) —
needed to get `npm run lint` (tsc --noEmit) green to verify this change.

Verified: `npm run lint` passes clean.

**Known gap, deferred (not part of this fix, needs a data-model change):**
`AppNotification` has no `workspaceId`, so the notifications list itself isn't workspace-scoped
yet (bell icon count/list). Tackle this in Phase 4 (Notification Settings) since it needs a
schema change touching `types.ts`, `seedData.ts`, and every `setNotifications` call site.

## Phase 2 — Google Material Symbols icon audit — ✅ DONE (2026-09-04)

Audit found `GoogleIcon.tsx` (Material Symbols wrapper) already existed and the font was
already loaded in `index.html`, but it was used **nowhere** — all 14 components used
`lucide-react` exclusively (130 icon call sites, ~60 distinct icons), i.e. two icon systems
were present with only one actually wired up.

Migrated all 130 call sites to `GoogleIcon` (mechanical batch change, done via a script —
`grep`-verified every usage first to confirm every one of them was the single pattern
`<Icon className="w-N h-N ...">`, then a Python pass rewrote each file: dropped the
`lucide-react` import, added `GoogleIcon`, converted Tailwind `w-N h-N` size classes to a
`size={px}` prop, mapped each lucide name to its Material Symbols equivalent, and converted
lucide's `stroke-[3]` bold-checkmark hack to `weight={700}` on the font glyph). Handled
`Name as Alias` import aliases (`Calendar as CalendarIcon`, etc.) as a special case.

Removed the now-unused `lucide-react` dependency from `package.json`.

Verified: `npm run lint` (tsc) and `npm run build` both pass clean; no leftover
`lucide-react` imports anywhere in `src/`.

**Deferred, minor:** requirements.txt also asks for tooltips on unfamiliar icon-only
buttons. Most already have a `title` attribute (carried over untouched by the migration);
a full sweep for the few that might be missing one wasn't done — worth a quick pass during
Phase 3/4 UI polish rather than as its own session.

## Phase 2.5 — Type-safety hole + bugs it was hiding — ✅ DONE (2026-09-04)

While starting Phase 3, discovered `@types/react` / `@types/react-dom` were **never installed**
(not in `package.json`, not in `node_modules/@types`). With no React type declarations, every
React import silently resolved to `any`, so `tsc --noEmit` gave zero real coverage of any
component, hook, or context usage — it only ever caught errors in plain non-JSX code. Verified
this concretely (a deliberately made-up context property passed typecheck silently) before
installing `@types/react@19`/`@types/react-dom@19`, which is what surfaced the following
pre-existing, previously-invisible runtime bugs — all fixed:

- **`CreateProjectModal.tsx`**: "Create Project" called `createProject(name, key, description, color)`
  with 4 positional args against a function that takes one `data` object — every field landed
  as `undefined`. The dialog silently created broken projects. Fixed the call site; also had to
  supply `icon` (required field, no picker UI exists, defaulted to `'folder'`).
- **`SettingsModal.tsx`**: destructured `currentWorkspace`/`setCurrentUserId` from `useApp()`,
  neither of which exist (the context exposes `activeWorkspace`; there is no per-persona user
  switch) — Workspace Name always rendered blank. Also the "Workspace Members" list read
  `allUsers` (every user in the app) instead of `workspaceMembers` scoped to the active
  workspace — the same class of leak as Phase 1, just in a screen Phase 1 hadn't touched yet.
  Fixed both; member list now filters by `activeWorkspace.id`. Also fixed `.selectedCalendar`
  (doesn't exist) → `.calendarName` (the real `CalendarConnection` field) in two places.
- **`TopNavbar.tsx` / `App.tsx`**: `TopNavbarProps` declared and used `onOpenSearch`, but
  `App.tsx` never passed it — the entire top search bar (desktop bar + mobile icon) was a
  decorative no-op, and the global `/` keyboard shortcut focused a `#topbar-search-input`
  element that didn't exist. Meanwhile `App.tsx` passed `onOpenShareModal`/`onToggleSidebar`,
  neither declared on `TopNavbarProps` — and there was no mobile hamburger button anywhere, so
  on a mobile viewport the sidebar (closed by default) could never be opened at all.
  Fixed by wiring the search bar to the existing (already-consumed-downstream-by-Kanban/List)
  `searchQuery`/`setSearchQuery` context state instead of a nonexistent modal, and adding a
  mobile hamburger button wired to `onToggleSidebar`. Dropped the unused `onOpenShareModal`
  pass-through (Sidebar and the Kanban board already expose sharing).
- **`TicketCard.tsx`**: native HTML5 `onDragStart` (needs `e.dataTransfer` for the Kanban
  drag-and-drop) on a `motion.div`, whose own typings declare `onDragStart` for Framer Motion's
  *pointer-gesture* drag system instead — a real typing collision, not a logic bug. Left the
  native handler as-is (it does work at runtime) and added a narrow, commented `as any` at the
  prop to document why.

Verified: `npm run lint` and `npm run build` both pass clean — and now actually mean something.

## Phase 3 — Settings page: Appearance/Theme/Colors/Typography/Kanban prefs — ⬜ NOT STARTED

`SettingsModal.tsx` and `src/utils/themeTokens.ts` already exist — need to read them before
scoping this phase (unknown how much is already built vs stubbed).

## Phase 4 — Account / Calendar / Notification settings + "Licensed To" — ⬜ NOT STARTED
Includes the deferred notification workspace-scoping gap from Phase 1.

## Phase 5 — SMART Goals feature — ⬜ NOT STARTED
Large, self-contained feature (nav entry, creation wizard, dashboard, goal detail, milestones,
check-ins, ticket linking, health calculation). Treat as its own multi-session block.

## Phase 6 — Firestore persistence & sync layer — ⬜ BLOCKED
Needs from user: the actual Firestore database/project path (requirements.txt leaves this as
a placeholder). Also a large architectural addition (repository layer, offline queue, security
rules) — do this last, after the UI-facing phases are settled, since the data shape will keep
shifting until Goals/Settings are done.

---
### How to resume
1. Read this file.
2. Pick the first `⬜ NOT STARTED` phase.
3. Do that phase only, verify with `npm run lint`, update this file, then stop and check in.
