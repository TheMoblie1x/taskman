# REQUIREMENTS.md — implementation progress

Working through `REQUIREMENTS.md` one phase at a time to keep sessions small and cheap.
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

**Deferred, minor:** REQUIREMENTS.md also asks for tooltips on unfamiliar icon-only
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

## Phase 3 — Settings page: Appearance/Theme/Colors/Typography/Kanban prefs — ✅ DONE (2026-09-04)

Found the data layer mostly already designed but entirely unwired: `types.ts` already had
`CustomColors`/`PresetThemeName`/`CustomThemeProfile`/`KanbanCardSettings`/`WorkspaceAppearanceSettings`,
and `src/utils/themeTokens.ts` had `applyThemeTokensToDOM` + 6 preset themes fully built —
but nothing called it, and its output CSS variable names (`--color-primary` etc.) didn't match
what `index.css`/the components actually render with (`--bg`, `--sidebar`, `--accent`, ...).

Built the working system:
- `themeTokens.ts`: retargeted `applyThemeTokensToDOM` to set the *real* consumed CSS vars;
  added `DEFAULT_KANBAN_CARD_SETTINGS`, `SUPPORTED_FONT_FAMILIES`, `SUPPORTED_FONT_SIZES`.
- `index.css`: added `--card`/`--kanban-column` vars (were hardcoded hex before) so card/column
  backgrounds are actually themeable; added a `[data-high-contrast]` border rule; added the
  `spacious` density tier (type already allowed it, no CSS existed); removed two hardcoded
  `.dark` overrides that were silently defeating custom sidebar/card colors in dark mode.
- `AppContext.tsx`: added `presetTheme`, `customColors`, `fontFamily`, `fontSize`,
  `kanbanCardSettings`, `customThemeProfiles` state + actions (`setPresetTheme`,
  `setCustomColors` merge, `setFontFamily`, `setFontSize`, `setKanbanCardSettings` merge,
  `saveCustomTheme`/`applyCustomTheme`/`renameCustomTheme`/`deleteCustomTheme`,
  `resetAppearance`); persisted via the existing localStorage blob; a single `useEffect`
  calls `applyThemeTokensToDOM` on any change. `theme`/`setTheme`/`toggleTheme` (already typed
  for all 4 `ThemeMode`s, but only ever implemented light/dark) now genuinely support
  system/high-contrast too.
- `SettingsModal.tsx`: rebuilt the old 2-option "Density & Display" tab into a full
  "Appearance" tab — theme mode picker, 6-swatch preset gallery, 6-field custom color grid
  (native color inputs), font family/size + 3-way density, 7 Kanban-card visibility
  checkboxes + card radius/column width selects, save/apply/delete custom theme profiles,
  reset-to-default.
- `TicketCard.tsx` / `KanbanBoard.tsx`: wired `kanbanCardSettings` so the toggles actually
  affect the board — each card field (ticket id/type/priority/labels/due date/subtasks/
  assignee) is conditionally rendered, card radius is applied via inline style (has to beat
  the `.card` class), and column width now derives from both density and the new setting.

Verified with a live smoke test (`npm run dev` + browser): switched to the Forest preset —
sidebar/cards/columns re-themed live; unchecked "Assignee" — avatars disappeared from every
card; typed in the (previously dead) top search bar — board filtered live. No console errors.

**Explicitly deferred** (kept out to keep this phase shippable): per-workspace appearance
override (`WorkspaceAppearanceSettings` type exists, item 10 in REQUIREMENTS.md says "where
appropriate" — global-only for now). Account/Calendar/Notification/Licensed-To settings
sections are Phase 4, not this one.

## Housekeeping — consolidated with pre-existing seed data, fixed deferred notification leak — ✅ DONE (2026-09-04)

Discovered mid-Phase-4-prep that `seedData.ts`/`types.ts` are much richer than my earlier
skim suggested — I'd only ever read them in fragments. They already contain, fully built and
realistic, but **completely unused** (same "infrastructure exists, nothing wires it up"
pattern as `GoogleIcon.tsx` and `themeTokens.ts` before Phases 2–3):
- `INITIAL_GOALS` — a full realistic SMART Goals dataset across all 3 workspaces (this is
  Phase 5's data layer, already done).
- `INITIAL_KANBAN_SETTINGS`, `INITIAL_NOTIFICATION_SETTINGS`, `INITIAL_CALENDAR_SETTINGS` —
  default settings objects matching the `KanbanCardSettings`/`NotificationSettings`/
  `CalendarSettings` types exactly.
- `Ticket.workspaceId` (optional) and `AppNotification` were already designed with workspace
  scoping in mind by the original scaffold — I'd independently derived the same scoping in
  Phase 1 rather than noticing the field.

Fixed the one real duplication this caused: Phase 3 had defined its own
`DEFAULT_KANBAN_CARD_SETTINGS` in `themeTokens.ts` instead of using the identical
`INITIAL_KANBAN_SETTINGS` that already existed in `seedData.ts` — removed mine, switched
`AppContext.tsx` to import the canonical one.

Also finished the notification workspace-scoping gap deferred at the end of Phase 1: added
`workspaceId` to `AppNotification` (type + all 4 notification-creation call sites in
`AppContext.tsx` + seed data), added a `workspaceNotifications` derived selector alongside
`workspaceTickets`/`workspaceProjects`, and switched `Sidebar.tsx` (unread badge) and
`TopNavbar.tsx` (bell dropdown + count) to read from it instead of the raw global list.

Verified: `npm run lint` and `npm run build` both pass clean.

## Phase 4 — Account / Calendar / Notification settings + "Licensed To" — ✅ DONE (2026-09-04)

Used the pre-existing `INITIAL_NOTIFICATION_SETTINGS`/`INITIAL_CALENDAR_SETTINGS` (seedData.ts)
as the canonical defaults, per the Housekeeping note above — no duplication this time.

- `AppContext.tsx`: added `notificationSettings`/`setNotificationSettings` and
  `calendarSettings`/`setCalendarSettings` state (partial-merge setters, same pattern as
  `kanbanCardSettings`), persisted through the existing localStorage blob, reset by
  `resetToDefaults`.
- `SettingsModal.tsx`: the 4-tab bar was hand-duplicated per tab (`className` block repeated
  4 times) — refactored to a `TABS` data array + `.map()` before adding 3 more, per the
  no-repeated-patterns rule. Added:
  - **Calendar** (renamed from "Calendar Sync"): existing Google/Microsoft connection UI
    unchanged, added a new "Sync Preferences" section under it — default calendar, auto-create
    events, auto-sync changes, default event duration, remove-on-ticket-delete.
  - **Notifications** (new tab): the 7 per-event toggles from `NotificationSettings` +
    in-app/email delivery-channel toggles.
  - **Account** (new tab): profile (avatar/name/email), Google account info (from
    `currentUser.googleId`), connected-calendars summary (from `calendarConnections`), Sign
    Out (confirms, then flips `isGuestViewer` and closes the modal — there's no real auth to
    tear down, so this reuses the app's existing view-only mode rather than faking a log-out),
    Delete Account (explains it needs a backend this local demo doesn't have, per the
    requirement not to fake server-side state).
  - **About** (new tab): the "Licensed To" section exactly as specified in REQUIREMENTS.md
    (product/version/licensed-to/license/status/valid-until/copyright), with a note that the
    license fields are placeholders pending a real licensing service (per the requirement not
    to hardcode license status as if it were server-verified).

Verified: `npm run lint` + `npm run build` clean, and a live smoke test of all 4 new/changed
tabs (screenshots) — correct data, working toggles, Sync Preferences wired to state.

## Phase 5 — SMART Goals feature — ✅ DONE (2026-09-04)

Data layer already existed (`INITIAL_GOALS`, full `Goal`/`GoalMilestone`/`GoalCheckIn`/
`GoalActivity` types) — this phase built the calculation logic, state/CRUD, and UI on top of it.

- `src/utils/goalUtils.ts` (new): `calculateGoalProgress` (derives % from milestone/linked-ticket
  completion **only** when `measurementType === 'milestones'`; otherwise from
  `currentValue`/`targetValue` — see bug note below), `calculateGoalHealth` (simple
  expected-vs-actual-pace comparison against the goal's timeframe), `computeSmartChecks`/
  `computeSmartScore`, `isGoalProgressDerived`, plus display constants/option lists.
- `AppContext.tsx`: `goals`/`workspaceGoals` state + `createGoal`, `updateGoal`, `deleteGoal`,
  `updateGoalProgress`, `addGoalMilestone`/`toggleGoalMilestone`/`deleteGoalMilestone`,
  `addGoalCheckIn`, `linkTicketToGoal`/`unlinkTicketFromGoal`. `health` is a **stored,
  user-overridable** field (matches the type and the "user can override the assessment"
  requirement) — recomputed inside these mutations, not live on every render, so seed/authored
  health narratives aren't silently clobbered by a recalculation nobody triggered.
- New components: `GoalCard.tsx` (dashboard card), `GoalsView.tsx` (dashboard: stat tiles,
  All/Active/On Track/At Risk/Behind/Completed/Overdue filters, card grid),
  `CreateGoalModal.tsx` (6-step SMART wizard: Specific → Measurable → Relevant → Time-bound →
  Achievable with live required-pace calc → Review with SMART score, non-blocking per spec),
  `GoalDetailModal.tsx` (progress, health override, milestones checklist, linked-ticket
  linking, check-in form + history, activity feed, delete/mark-complete).
- `Sidebar.tsx`: "Goals" nav entry (badge = active goals at-risk/behind/overdue) between My
  Tasks and Calendar, matching the REQUIREMENTS.md nav example. `App.tsx`: view wiring +
  both modals + a `5` keyboard shortcut alongside the existing `1`-`4`.

**Two real bugs caught by live-testing before shipping (not left for later):**
1. `calculateGoalProgress` originally used milestone-completion-ratio whenever a goal *had*
   milestones, regardless of its actual `measurementType` — so "Ship Android v2.0" (a
   percentage goal at 78%, with 1 of 4 supplementary milestones checked) displayed 25%.
   Fixed to only derive from milestones/tickets when that's the goal's actual measurement type.
2. `CreateGoalModal` called `useMemo` after an early `if (!isOpen) return null`, a Rules-of-Hooks
   violation — invisible until the modal was closed and reopened (hook count changed between
   renders), at which point it crashed the whole app to a blank page with no error boundary.
   Replaced with a plain computed value (it wasn't expensive enough to need memoizing anyway).

Verified: `npm run lint` + `npm run build` clean; full live walkthrough (dashboard → open a
seeded goal → toggle a milestone → health auto-updates → full 6-step creation wizard → new
goal appears and opens → deleted the test goal). No console errors.

## Phase 6 — Firestore persistence & sync layer — ⬜ BLOCKED

Asked the user for a Firestore project; they're creating a new Firebase project and will come
back with the ID (and database ID, if using a named database — default is usually fine).
Still blocked until that arrives. Also a large architectural addition (repository layer,
offline queue, security rules) — do this last, now that the UI-facing phases are settled and
the data shape (Goals included) has stabilized.

---
### How to resume
1. Read this file.
2. Pick the first `⬜ NOT STARTED` phase.
3. Do that phase only, verify with `npm run lint`, update this file, then stop and check in.
