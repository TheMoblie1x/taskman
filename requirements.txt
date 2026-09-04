Here is a focused prompt for **only those changes**, written so you can give it directly to your UI/code-generation agent:

## Workspace Switching, Google Icons & Settings Requirements

Update the existing application without changing the existing product structure or core Kanban/ticket functionality.

### 1. Fix Workspace Switching

There is currently a critical workspace-context issue:

**When the user switches the active workspace, the tasks/tickets shown on the screen do not change.**

Fix this completely.

The currently selected workspace must become the single source of truth for all workspace-scoped data.

When the user switches:

```text
Workspace A
      ↓
Workspace B
```

the application must immediately refresh/reload the workspace-specific:

* Projects
* Boards
* Kanban columns
* Tickets
* Tasks
* Assignees
* Members
* Labels
* Notifications
* Activity
* Any other workspace-scoped data

For example:

```text
Workspace: Personal

Personal Board
├── Buy groceries
├── Pay electricity bill
└── Book appointment
```

Switch to:

```text
Workspace: Work

Work Board
├── Fix Android BLE issue
├── Review PR
└── Prepare release
```

The Personal tasks must **never remain visible inside the Work workspace**.

### Workspace Context Rules

The application should maintain an explicit:

```text
activeWorkspaceId
```

All workspace-scoped queries, API calls, state selectors and UI components must use this value.

Do not keep a single global task list that is reused across workspaces.

The data flow should conceptually be:

```text
activeWorkspaceId
        ↓
Workspace Store / Context
        ↓
Projects
        ↓
Boards
        ↓
Tickets
        ↓
Kanban UI
```

When `activeWorkspaceId` changes:

1. Clear/invalidate the previous workspace's derived data.
2. Load the newly selected workspace data.
3. Update the sidebar/project navigation.
4. Update the Kanban board.
5. Update ticket counts.
6. Update "My Tasks".
7. Update filters and search context.
8. Update member/assignee information.
9. Preserve only genuinely global data such as the user's profile and global application settings.

Prevent stale data from the previous workspace from appearing during the transition.

If cached data is used, cache it by:

```text
workspaceId
```

and never use another workspace's cache as the active workspace's data.

---

# 2. Google Icons

Use **Google Material Symbols / Material Icons** wherever an appropriate icon exists instead of creating custom SVG icons unnecessarily.

Use icons consistently throughout the application for:

* Workspace selector
* Projects
* Boards
* Search
* Add/Create
* Settings
* Calendar
* Notifications
* User/profile
* Members
* Share
* Edit
* Delete
* More actions
* Filters
* Sort
* Due dates
* Priority
* Comments
* Attachments
* Subtasks
* Back navigation
* Close
* Expand/collapse
* View switching
* Theme settings

Prefer:

```text
Material Symbols
```

with appropriate weights and sizes.

Icons should remain visually consistent across the entire application.

Do not mix several unrelated icon libraries unless there is a strong reason.

Icons should be:

* Simple
* Minimal
* Consistent
* Accessible
* Properly aligned with text
* Sized according to their surrounding control

Use tooltips for unfamiliar icon-only actions.

---

# 3. Add Settings Page

Add a dedicated:

**Settings**

section to the application.

Settings should be accessible from the main sidebar and user/profile menu.

Example:

```text
Settings

Appearance
Workspace
Board
Notifications
Calendar
Account
About
```

---

# 4. Appearance & Theme Customization

The Appearance section should allow users to customize the visual appearance of the application.

Support multiple built-in themes.

At minimum:

* Light
* Dark
* System
* Default
* High Contrast

The architecture should allow additional themes to be added later.

Example:

```text
Theme

○ System
○ Light
● Dark
○ High Contrast
```

Also provide several professionally designed preset themes.

For example:

```text
Default
Midnight
Slate
Forest
Ocean
Warm
```

The exact theme names can be finalized during UI design.

---

# 5. Custom Colors

Advanced users should be able to customize application colors.

Allow customization of:

### Application

* Primary color
* Secondary color
* Accent color
* Main background
* Main text
* Secondary text

### Panels

* Sidebar background
* Sidebar text
* Board background
* Board column background
* Ticket/card background
* Header background
* Modal background
* Settings panel background

### UI States

* Hover
* Selected
* Focus
* Active
* Disabled
* Success
* Warning
* Error

Use a centralized design-token system rather than hardcoding colors throughout components.

Example:

```text
--color-primary
--color-background
--color-surface
--color-sidebar
--color-card
--color-text
--color-text-secondary
--color-border
--color-success
--color-warning
--color-error
```

Changing a theme should update these tokens globally.

---

# 6. Typography Customization

Allow users to customize typography.

Settings should include:

### Font family

Provide a controlled list of supported fonts.

### Base font size

Example:

```text
Small
Medium
Large
Extra Large
```

### UI density

```text
Compact
Comfortable
Spacious
```

This should affect:

* Sidebar
* Kanban cards
* Ticket details
* Tables
* Forms
* Settings
* Navigation

Do not allow arbitrary font sizes that can break the layout.

Use predefined ranges/tokens to preserve usability and accessibility.

---

# 7. Kanban Customization

Provide board-specific appearance settings.

Users should be able to customize:

* Board background
* Column background
* Card background
* Card border
* Card radius
* Card density
* Column width
* Column header appearance
* Show/hide ticket IDs
* Show/hide assignee
* Show/hide priority
* Show/hide labels
* Show/hide due date
* Show/hide ticket type

Example:

```text
Kanban Card

☑ Ticket ID
☑ Assignee
☑ Priority
☑ Labels
☑ Due date
☐ Description preview
```

---

# 8. Multiple Themes

Themes should be implemented as configuration rather than separate UI implementations.

Conceptually:

```text
Theme
  ↓
Design Tokens
  ↓
Application Components
```

For example:

```text
Light Theme
├── background
├── surface
├── card
├── text
└── accent

Dark Theme
├── background
├── surface
├── card
├── text
└── accent
```

This makes it possible to add new themes without rewriting components.

---

# 9. Save & Reset Customization

Appearance settings should persist for the user.

Provide:

**Reset to Default**

which restores the application's default theme and typography.

Also provide:

**Save as Theme**

for custom configurations.

Example:

```text
My Themes

Personal Dark
Work Light
Minimal
```

Users should be able to:

* Create custom theme
* Rename theme
* Apply theme
* Delete custom theme

---

# 10. Workspace-Specific Appearance

Where appropriate, allow appearance settings to be either:

### Global

Applies to the entire application.

or

### Workspace-specific

Example:

```text
Personal Workspace
→ Dark theme

Work Workspace
→ Light theme
```

Workspace-specific settings should override global settings only when explicitly configured.

---

# 11. Settings Navigation

Use a desktop settings layout similar to:

```text
┌─────────────────────────────────────────────────────────┐
│ Settings                                                │
├──────────────────┬──────────────────────────────────────┤
│                  │                                      │
│ Appearance       │ Appearance                           │
│ Workspace        │                                      │
│ Board            │ Theme                                │
│ Notifications    │                                      │
│ Calendar         │ ○ System                             │
│ Account          │ ● Dark                               │
│ About            │                                      │
│                  │ Preset Themes                        │
│                  │                                      │
│                  │ [Default] [Midnight] [Slate]         │
│                  │                                      │
│                  │ Colors                               │
│                  │                                      │
│                  │ Primary      [████████]              │
│                  │ Background   [████████]              │
│                  │ Sidebar      [████████]              │
│                  │ Card         [████████]              │
│                  │                                      │
│                  │ Typography                           │
│                  │                                      │
│                  │ Font         [Inter ▼]               │
│                  │ Size         [Medium ▼]              │
│                  │ Density      [Comfortable ▼]         │
│                  │                                      │
│                  │ [Reset to Default]                  │
└──────────────────┴──────────────────────────────────────┘
```

The settings UI should remain clean and not feel like an enterprise configuration panel.

---

# 12. Account Settings

Include:

* Profile picture
* Name
* Email
* Google account information
* Connected calendar accounts
* Sign out
* Account deletion

Google authentication remains the primary authentication mechanism.

---

# 13. Calendar Settings

The existing Google Calendar and Microsoft Calendar integrations should have their own settings section.

Show:

```text
Calendar Integrations

Google Calendar
Connected
[Manage]

Microsoft Calendar
Connected
[Manage]
```

Allow users to configure:

* Default calendar
* Automatically create calendar events
* Calendar synchronization
* Default event duration
* Remove calendar event when ticket is deleted
* Calendar notification preferences

---

# 14. Notification Settings

Allow users to configure:

```text
Notifications

Ticket assigned to me       ON
Mentioned in comment        ON
Ticket status changed       ON
Due date approaching        ON
Overdue ticket              ON
Board invitation            ON
Calendar changes            ON
```

Support:

* In-app notifications
* Email notifications
* Push notifications where supported

---

# 15. Licensed To

Add a **Licensed To** section under the About / Account area.

Display the license information clearly.

Example:

```text
About

Product Name
Version 1.0.0

Licensed To
Rahul Pahuja

License
Professional

License Status
Active

License Valid Until
September 4, 2027

© 2026 Company Name
All rights reserved.
```

The exact license fields should come from the backend/license service where applicable.

Do not hardcode license status if licensing is implemented server-side.

---

# 16. General UX Requirements

The new functionality should feel like part of the existing application.

Do not introduce a completely different visual language for Settings.

Maintain:

* Existing spacing system
* Existing typography hierarchy
* Existing border radius
* Existing component language
* Material iconography
* Responsive behavior

The Settings page must work well on:

* Desktop
* Tablet
* Mobile web

---

# 17. Important Implementation Constraint

The workspace bug must be treated as a **data/state architecture issue**, not merely a UI refresh issue.

Do not fix this by simply forcing the Kanban component to re-render.

The application's data layer must correctly scope all workspace-dependent entities by:

```text
workspaceId
```

The active workspace must flow through the application's state/query architecture.

Expected behavior:

```text
Select Workspace A
        ↓
activeWorkspaceId = A
        ↓
Load A's projects
        ↓
Load A's boards
        ↓
Load A's tickets
        ↓
Render A


Select Workspace B
        ↓
activeWorkspaceId = B
        ↓
Invalidate A's workspace-scoped state
        ↓
Load B's projects
        ↓
Load B's boards
        ↓
Load B's tickets
        ↓
Render B
```

There must be **zero cross-workspace data leakage in the UI**.

Also verify that:

* Search is workspace-aware
* Filters are workspace-aware
* My Tasks is correctly scoped
* Board counts are workspace-aware
* Assignee lists are workspace-aware
* Activity is workspace-aware
* Cached data is workspace-aware
* URL routes contain enough context to restore the correct workspace
* Refreshing the browser preserves the correct active workspace
* Opening a deep link to a board automatically selects the correct workspace

---

# Acceptance Criteria

### Workspace

* Switching workspaces changes all displayed projects, boards and tickets.
* No ticket from Workspace A appears in Workspace B.
* Search and filters respect the active workspace.
* Browser refresh preserves the selected workspace.
* Deep links correctly restore workspace context.
* Cached data never leaks across workspaces.

### Icons

* Material Symbols/Google icons are used consistently throughout the application.
* No unnecessary custom icon implementations are introduced.

### Settings

* A dedicated Settings page exists.
* Users can change theme.
* Users can customize supported colors.
* Users can customize typography size.
* Users can customize UI density.
* Users can customize Kanban card visibility.
* Users can create and apply custom themes.
* Users can reset appearance settings.
* Calendar and notification settings are accessible.
* Account information is accessible.
* "Licensed To" information is displayed.
* Settings persist across sessions and devices where appropriate.

### Quality

The implementation should preserve the existing Kanban/ticket functionality and should not introduce regressions to:

* Ticket creation
* Ticket editing
* Drag and drop
* Assignment
* Comments
* Board sharing
* Calendar integration
* Authentication
* Workspace permissions
## SMART Goals Feature Requirements

Add a dedicated **Goals** feature to the application.

The goal system should not behave like a simple task list. It should help users define meaningful objectives and track measurable progress toward them using the existing projects, boards, tickets and tasks.

The goal creation experience must guide the user toward creating **SMART goals**:

* **Specific**
* **Measurable**
* **Achievable**
* **Relevant**
* **Time-bound**

The UX should actively help the user create a well-defined goal instead of simply asking for a title.

---

# 1. Goals Section

Add **Goals** to the primary application navigation.

Example:

```text
My Work
├── Inbox
├── My Tasks
├── Goals
├── Calendar
│
Projects
├── Android App
├── Backend
└── Website
│
Shared With Me
└── ...
```

The Goals page should provide:

* Active goals
* Completed goals
* Overdue goals
* Upcoming goals
* Goal progress
* Goal health/status
* Goal deadlines

---

# 2. Goal Creation

When creating a goal, do not show only:

```text
Goal title
Description
Save
```

Instead, guide the user through the SMART framework.

The creation flow should be:

```text
Goal
  ↓
Specific
  ↓
Measurable
  ↓
Achievable
  ↓
Relevant
  ↓
Time-bound
  ↓
Review
  ↓
Create Goal
```

The user should be able to complete this quickly without feeling like they are filling out a complicated form.

---

# 3. Specific

The user should clearly define **what they want to accomplish**.

Ask:

> What exactly do you want to achieve?

Example:

Bad:

```text
Get better at Android
```

Better:

```text
Improve my Android architecture skills by building and shipping a production-quality sample application using Clean Architecture and Jetpack Compose.
```

Provide contextual guidance below the field rather than requiring the user to understand the SMART framework themselves.

---

# 4. Measurable

Every goal should ideally have at least one measurable success criterion.

Allow users to define:

### Numeric target

```text
Target: 100
Current: 42
Unit: Users
```

### Percentage

```text
Target: 100%
Current: 65%
```

### Count

```text
Write 20 technical articles
Completed: 7
```

### Milestones

```text
Milestones

☑ Define architecture
☑ Build core functionality
☐ Add tests
☐ Deploy application
```

### Binary goal

For goals where numeric measurement doesn't make sense:

```text
Complete / Not Complete
```

The user should not be forced to invent meaningless metrics.

---

# 5. Goal Measurement Types

Support:

```text
Number
Percentage
Currency
Duration
Count
Milestones
Binary
Custom
```

Example:

```text
Goal:
Run 100 km this month

Current:
62 km

Target:
100 km

Progress:
62%
```

Another example:

```text
Goal:
Publish 10 Android articles

Current:
4

Target:
10

Progress:
40%
```

---

# 6. Achievable

The system should help users determine whether the goal is realistically achievable.

Do not make this an intrusive AI judgement.

Instead, ask lightweight questions:

```text
How much time can you dedicate?

[5 hours / week]

Current progress:

[42]

Target:

[100]
```

The system can calculate the required pace.

Example:

```text
Current: 42
Target: 100
Remaining: 58

Time remaining: 4 weeks

Required pace:
14.5 / week
```

Display a simple health indicator:

```text
On track
At risk
Behind
```

The user should be able to override this assessment.

---

# 7. Relevant

Every goal should optionally be associated with a broader purpose.

Ask:

> Why does this goal matter?

Example:

```text
Why is this important?

To prepare for senior/staff-level Android opportunities.
```

Allow the user to associate a goal with:

* Workspace
* Project
* Board
* Personal area

Example:

```text
Goal
 ↓
Project
 ↓
Board
 ↓
Tickets
```

This makes goals connected to actual work rather than isolated notes.

---

# 8. Time-Bound

Every goal should have a clear timeframe.

Required:

* Start date
* Target date

Optional:

* Target time
* Recurring review
* Milestone deadlines

Example:

```text
Start:
September 1, 2026

Target:
October 31, 2026
```

The system should clearly display:

```text
57 days remaining
```

For overdue goals:

```text
7 days overdue
```

---

# 9. Goal Progress

Each goal should have a visual progress indicator.

Example:

```text
Publish 20 Android articles

████████████░░░░░░░░ 60%

12 / 20 completed

Target:
October 31

On track
```

Progress should be calculated from the selected measurement method.

---

# 10. Link Goals to Existing Work

This is an important feature.

Users should be able to connect existing tickets/tasks to a goal.

Example:

```text
Goal

Launch Android Bluetooth Library

Progress
████████████░░░░ 75%

Linked work

☑ Architecture
☑ BLE discovery
☑ Device pairing
☐ Background scanning
☐ Documentation
```

Completing linked tickets should automatically contribute to goal progress where the goal uses milestone/task-based measurement.

The user should be able to manually adjust progress when required.

---

# 11. Goal → Project Relationship

A goal can optionally belong to a project.

Example:

```text
Goal
Improve Android app performance

Project
Android App
```

The goal should then be visible from the project overview.

---

# 12. Goal Dashboard

The Goals page should provide a high-level overview.

Example:

```text
Goals

ACTIVE

┌──────────────────────────────────────┐
│ Ship Android v2.0                    │
│ ███████████████░░░ 78%              │
│ Due Sep 30                           │
│ ● On track                           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Publish 20 Android Articles          │
│ ██████████░░░░░░░░ 50%              │
│ Due Oct 31                           │
│ ⚠ At risk                            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Reach 1,000 users                    │
│ ████████████████░░ 82%              │
│ Due Nov 15                           │
│ ● On track                           │
└──────────────────────────────────────┘
```

---

# 13. Goal Details

Clicking a goal should open a detailed view.

```text
Goal

Ship Android v2.0

Specific
Launch the production release of Android v2.0.

Measurement
Release successfully to production.

Progress
████████████████░░ 85%

Start
Sep 1

Deadline
Sep 30

Why
Major product milestone.

Status
● On track

Linked Project
Android App

Linked Work
├── Authentication
├── Bluetooth
├── Notifications
└── Release preparation
```

---

# 14. Goal Health

Automatically calculate goal health based on:

* Current progress
* Expected progress
* Time remaining
* Completed milestones
* Deadline

Possible states:

```text
On Track
At Risk
Behind
Completed
Overdue
Paused
```

Example:

```text
Target progress by today: 60%
Actual progress: 72%

● On Track
```

If:

```text
Target progress: 60%
Actual progress: 35%
```

show:

```text
⚠ At Risk
```

Avoid making health calculation overly complicated in the MVP.

---

# 15. Milestones

Goals can contain milestones.

Example:

```text
Goal:
Launch Android App

Milestones:

☑ Architecture
☑ Core development
☐ QA
☐ Beta release
☐ Production release
```

Each milestone can optionally have:

* Name
* Description
* Deadline
* Linked tickets
* Completion state

---

# 16. Goal Check-ins

Users should be able to periodically review a goal.

Provide:

**Add Check-in**

Example:

```text
Weekly Check-in

Progress:
62%

What changed?
Completed BLE implementation.

What's blocking progress?
Waiting for API changes.

Next step:
Complete integration testing.
```

The goal should maintain a chronological check-in history.

---

# 17. Goal Activity

Track important goal changes.

Example:

```text
Activity

Sep 4
Progress changed 42% → 55%

Sep 3
Milestone "BLE integration" completed.

Sep 1
Goal created.

Sep 1
Deadline changed from Oct 15 → Oct 31.
```

---

# 18. SMART Validation

The application should provide a lightweight SMART score before allowing the goal to be finalized.

Example:

```text
SMART Check

✓ Specific
✓ Measurable
✓ Achievable
✓ Relevant
✓ Time-bound

SMART Goal Score
5 / 5

Excellent. This goal is clearly defined.
```

If something is missing:

```text
SMART Check

✓ Specific
⚠ Measurable
✓ Achievable
✓ Relevant
✓ Time-bound

Your goal does not currently have a measurable outcome.

[Add Measurement]
```

The user should still be allowed to save the goal if they intentionally choose to proceed.

Do not make SMART validation a hard blocker.

---

# 19. AI-Assisted Goal Creation

The architecture should allow future AI assistance.

For example, the user could type:

```text
I want to become better at system design.
```

The application could suggest:

```text
Specific
Complete a structured system design learning plan.

Measurable
Complete 12 system design exercises.

Achievable
Complete 3 exercises per week.

Relevant
Prepare for senior/staff engineering interviews.

Time-bound
Complete by November 30.
```

The user must be able to edit every generated field.

AI suggestions must never silently modify the user's goal.

---

# 20. Goal Notifications

Support optional reminders:

* Goal deadline approaching
* Goal overdue
* Weekly check-in
* Goal at risk
* Milestone approaching
* Milestone completed

Users should be able to configure notification preferences.

---

# 21. Goal and Calendar Integration

Goals should integrate with the existing calendar system where appropriate.

The goal itself should not automatically become a calendar event.

Instead, milestones, check-ins and scheduled goal work can optionally be added to:

* Google Calendar
* Microsoft Calendar

Example:

```text
Goal:
Launch Android v2.0

Milestone:
Beta release

[Add to Calendar]
```

---

# 22. Goal Filters

Support:

```text
All
Active
On Track
At Risk
Behind
Completed
Overdue
```

Also allow filtering by:

* Workspace
* Project
* Owner
* Deadline

---

# 23. Workspace Awareness

Goals must follow the same workspace architecture as projects and tickets.

When switching:

```text
Workspace A
      ↓
Workspace B
```

the Goals page must show only Workspace B's workspace-scoped goals.

There must be no cross-workspace goal leakage.

The active workspace must be the source of truth for:

```text
Projects
Boards
Tickets
Tasks
Goals
Members
Labels
Activities
```

Personal/global goals can exist separately if the product supports them.

---

# 24. Goal Data Model

Recommended model:

```text
Goal

id
workspace_id
project_id

title
description
purpose

measurement_type
current_value
target_value
unit

start_date
target_date

status
health

owner_id

created_at
updated_at
completed_at
```

---

# 25. Goal Milestone

```text
GoalMilestone

id
goal_id

title
description

target_date

status
position

created_at
updated_at
completed_at
```

---

# 26. Goal-Ticket Relationship

```text
GoalTicket

id
goal_id
ticket_id

contribution_type
contribution_value

created_at
```

This allows a goal to be connected to existing project work.

---

# 27. Goal Check-in

```text
GoalCheckIn

id
goal_id
user_id

progress_value
notes

created_at
```

---

# 28. UX Principle

The Goals feature should **not become another project-management dashboard**.

Keep the experience focused:

```text
What do I want?
        ↓
How will I measure it?
        ↓
Why does it matter?
        ↓
When must it be done?
        ↓
What work gets me there?
        ↓
Am I on track?
```

The user should understand the state of all active goals at a glance.

---

# Acceptance Criteria

### Goal Creation

* User can create a goal.
* Goal creation guides the user through SMART principles.
* User can define a measurable target.
* User can define a deadline.
* User can explain why the goal matters.
* User can define milestones.
* User can link tickets/tasks to a goal.
* User can save a goal even if SMART validation is incomplete.

### Progress

* Goal progress is calculated correctly.
* Progress can be manually updated.
* Milestone completion can contribute to progress.
* Linked ticket completion can contribute to progress.
* Goal health updates based on progress and deadline.

### Collaboration

* Goals belong to the correct workspace.
* Workspace switching updates goals correctly.
* Goal owners and members are respected.
* Goal activity is tracked.

### Calendar

* Milestones can be added to Google Calendar.
* Milestones can be added to Microsoft Calendar.
* Goal check-ins can optionally be scheduled.
* Calendar mappings remain associated with the correct goal/milestone.

### UX

The Goals feature should feel like a natural extension of the existing:

**Workspace → Project → Board → Ticket**

architecture:

```text
Workspace
│
├── Goals
│    ├── Goal
│    │    ├── Milestones
│    │    ├── Linked Tickets
│    │    └── Check-ins
│
└── Projects
     └── Boards
          └── Tickets
```

The ultimate purpose of the feature is to connect **high-level objectives with the actual work required to achieve them**, rather than creating a disconnected goal-tracking system.



## Firestore Data Persistence & Synchronization

Add **Firebase Firestore** as the cloud persistence layer for the application.

I will provide the Firestore database/project path separately.

**Firestore database/path:**

`<ADD FIRESTORE DATABASE/PATH HERE>`

Do not hardcode any placeholder path into production logic. Keep the Firestore configuration centralized so the database/path can be changed without modifying business logic.

### Architecture

Implement the application using an offline-first repository architecture:

```text
                    ┌──────────────┐
                    │      UI      │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │ Repository   │
                    └──────┬───────┘
                           │
                ┌──────────┴──────────┐
                ↓                     ↓
        Local Data Source      Firestore Data Source
                ↓                     ↓
          Local JSON              Firestore
                │                     │
                └──────────┬──────────┘
                           ↓
                      Sync Engine
```

The UI must not directly access Firestore.

All Firestore operations must go through the repository/data layer.

---

# Firestore Collections

Design the Firestore structure around the application's existing hierarchy:

```text
users
  ↓
workspaces
  ↓
projects
  ↓
boards
  ↓
tickets
```

Goals should also belong to the appropriate workspace/project.

A recommended structure is:

```text
users/{userId}

workspaces/{workspaceId}

workspaces/{workspaceId}/members/{userId}

workspaces/{workspaceId}/projects/{projectId}

workspaces/{workspaceId}/projects/{projectId}/boards/{boardId}

workspaces/{workspaceId}/projects/{projectId}/tickets/{ticketId}

workspaces/{workspaceId}/goals/{goalId}
```

Use subcollections where they make sense for high-volume or parent-owned data.

The exact structure can be adjusted based on Firestore query requirements.

---

# Required Firestore Data

Persist at minimum:

* Users
* Workspaces
* Workspace members
* Projects
* Boards
* Board columns
* Tickets
* Subtasks
* Goals
* Goal milestones
* Goal check-ins
* Comments
* Attachments metadata
* Labels
* Activities
* Share links
* Calendar event mappings
* User preferences

---

# Workspace Isolation

Workspace isolation is critical.

Every workspace-scoped entity must contain enough information to identify its workspace.

For example:

```json
{
  "id": "ticket_123",
  "workspaceId": "workspace_abc",
  "projectId": "project_123",
  "boardId": "board_123"
}
```

A user switching from:

```text
Workspace A
```

to:

```text
Workspace B
```

must cause all workspace-scoped Firestore queries/listeners to switch accordingly.

Never reuse Workspace A's Firestore snapshot for Workspace B.

---

# Real-Time Synchronization

Shared boards should support real-time updates.

Example:

```text
User A
  ↓
Updates ticket
  ↓
Firestore
  ↓
Realtime listener
  ↓
User B
  ↓
Board updates
```

Use Firestore realtime listeners for:

* Tickets
* Board changes
* Comments
* Members
* Goals
* Activity

Listeners must be properly unsubscribed when the user changes workspace/project/board.

This is particularly important to prevent stale data from the previous workspace appearing after a workspace switch.

---

# Offline Firestore Support

Take advantage of Firestore's offline capabilities where appropriate.

The application should be able to continue operating when the network is unavailable.

However, maintain the application's own local persistence/sync abstraction so that the system does not become tightly coupled to Firestore's offline implementation.

The architecture should support:

```text
Online:

UI
 ↓
Repository
 ↓
Local State
 ↓
Firestore
 ↓
Realtime updates


Offline:

UI
 ↓
Repository
 ↓
Local JSON
 ↓
Sync Queue
 ↓
Firestore when online
```

---

# Sync Strategy

The sync engine should synchronize:

```text
Local → Firestore
Firestore → Local
```

For every mutation:

```text
1. Update local state optimistically
2. Add mutation to sync queue
3. Attempt Firestore write
4. Confirm server response
5. Update local state with server version
6. Remove successful mutation from queue
```

The UI should remain responsive even when Firestore is slow or unavailable.

---

# Idempotency

Every mutation should have a unique mutation ID.

Example:

```json
{
  "mutationId": "01J...",
  "operation": "UPDATE_TICKET",
  "entityId": "ticket_123"
}
```

Retrying the same mutation must not create duplicate data or duplicate side effects.

---

# Conflict Resolution

Handle situations such as:

```text
Device A:
Ticket status → IN_PROGRESS

Device B:
Ticket status → DONE
```

Use:

* Entity versions
* `updatedAt`
* `updatedBy`
* Mutation IDs

The conflict strategy should be deterministic.

For simple fields, last-server-write-wins can be used initially.

For important collaborative operations such as ticket ordering, membership changes and deletion, use more explicit conflict handling.

---

# Security Rules

Firestore Security Rules must enforce authorization server-side.

Never rely only on frontend checks.

Every workspace request must verify:

```text
Authenticated user
       ↓
Workspace membership
       ↓
Role
       ↓
Requested operation
```

Example:

```text
Viewer
→ READ

Editor
→ READ + CREATE + UPDATE

Admin
→ READ + CREATE + UPDATE + MEMBER MANAGEMENT

Owner
→ FULL ACCESS
```

A user must never be able to access another workspace simply by modifying a `workspaceId` in a client request.

---

# Share Links

Share links must also be represented securely.

Example:

```text
shareLinks/{shareToken}
```

Store:

* Board ID
* Workspace ID
* Permission
* Created by
* Expiration
* Active status
* Created timestamp

Never expose sensitive internal IDs unnecessarily in the share URL.

---

# Calendar Mapping

Persist Google/Microsoft calendar mappings.

Example:

```json
{
  "ticketId": "AND-142",
  "provider": "google",
  "calendarId": "work",
  "externalEventId": "event_123",
  "lastSyncedAt": "...",
  "version": 4
}
```

The mapping must remain associated with the correct workspace/project/ticket.

---

# Settings

Persist user settings in Firestore so they can follow the user across supported devices.

Examples:

* Theme
* Font size
* UI density
* Color customization
* Kanban preferences
* Notification preferences
* Calendar preferences

Workspace-specific settings should be stored separately from global user settings.

Example:

```text
users/{userId}/settings

workspaces/{workspaceId}/settings
```

Workspace settings must not overwrite global settings unintentionally.

---

# Data Ownership

Clearly distinguish between:

### User-owned

```text
Profile
Global settings
Personal preferences
```

### Workspace-owned

```text
Projects
Boards
Tickets
Goals
Members
Activities
Share links
```

### Integration-owned

```text
Calendar connections
External calendar mappings
```

This distinction must be reflected in both the repository architecture and Firestore security rules.

---

# Required Behavior

The final application must support:

```text
Create ticket
      ↓
Save locally immediately
      ↓
Display immediately
      ↓
Write to Firestore
      ↓
Receive server confirmation
      ↓
Synchronize other devices
```

If offline:

```text
Create ticket
      ↓
Save locally
      ↓
Add to sync queue
      ↓
Continue using application
      ↓
Internet returns
      ↓
Sync with Firestore
```

The same behavior should apply to:

* Tickets
* Goals
* Boards
* Projects
* Comments
* Subtasks
* Settings
* Other mutable entities

---

# Critical Requirement

The application must have **one consistent repository/data layer** regardless of whether the data currently comes from local JSON or Firestore.

Do not implement separate business logic such as:

```text
if offline:
   use JSON implementation

if online:
   use Firestore implementation
```

inside UI components.

Instead:

```text
UI
 ↓
Repository
 ↓
Sync / Data Layer
 ├── Local JSON
 └── Firestore
```

The UI should simply request:

```text
getTickets(workspaceId)
createTicket(...)
updateTicket(...)
deleteTicket(...)
```

and should not care whether the operation is currently being served from local storage, Firestore, or both.

The final implementation must therefore be **offline-first, workspace-aware, realtime-capable, and safe for collaborative multi-user access**.

