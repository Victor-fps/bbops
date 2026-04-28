# BusinessBuild Ops — Make It Operational
**Date:** 2026-04-28
**Status:** Approved
**Scope:** Phase 1 (localStorage persistence + full CRUD) + Phase 3 (core missing features)

---

## Background

BusinessBuild Ops is a fully designed Neo's Noir project management app (pure black, cyan accent, Inter font) built as a no-build-step React app: one HTML entry point loading four JSX/JS files via Babel standalone, served by a local Python server. The design is complete and approved. The app is not yet operational because:

1. All data resets on page refresh (no persistence)
2. There is no UI to create or manage workspaces, areas, or projects
3. Several core features needed for daily use are missing or broken

This spec covers making the app fully operational for daily solo use on a single machine, with an import/export bridge for moving data between devices until a hosted backend exists.

**Cross-device note:** `localStorage` is per-browser, per-device. The import/export JSON feature is the bridge between machines. True cross-device sync (Mac ↔ PC) requires a hosted backend — that is Phase 2 scope, not this spec.

---

## Architecture

### File structure after this spec

```
BusinessBuild Ops.html   — entry point (adds app-storage.js script tag)
app-storage.js           — NEW: persistence module (window.BBStorage)
app-data.js              — CHANGED: wiped of placeholder data, defines empty default only
app-sidebar.jsx          — CHANGED: workspace/area CRUD, overdue badges, archive toggle
app-views.jsx            — CHANGED: overdue dashboard card, search panel, drag reorder
app-drawer.jsx           — CHANGED: notes auto-save fix
```

### Load order in HTML

```html
<script src="app-storage.js"></script>      <!-- plain JS, must load first -->
<script src="app-data.js"></script>
<script type="text/babel" src="app-sidebar.jsx"></script>
<script type="text/babel" src="app-views.jsx"></script>
<script type="text/babel" src="app-drawer.jsx"></script>
```

---

## Phase 1: Persistence

### app-storage.js

Exposes `window.BBStorage` with five methods:

| Method | Behavior |
|---|---|
| `BBStorage.load()` | Reads `bbops_data` from localStorage. If missing or version mismatch, returns the empty default workspace. |
| `BBStorage.save(workspaces)` | Serializes `{ version, savedAt, workspaces }` to localStorage under `bbops_data`. |
| `BBStorage.exportJSON(workspaces)` | Creates a timestamped `.json` file download (e.g. `bbops-2026-04-28.json`). |
| `BBStorage.importJSON(onSuccess, onError)` | Opens a native file picker, parses the JSON, validates the version field, calls `onSuccess(workspaces)` or `onError(message)`. |
| `BBStorage.clear()` | Removes `bbops_data` from localStorage. Used by a "Reset all data" danger action. |

**localStorage data format:**
```json
{
  "version": 1,
  "savedAt": "2026-04-28T14:32:00.000Z",
  "workspaces": [ ... ]
}
```

The `version` field enables schema migrations. If a future version adds a new field to tasks, `load()` backfills it on read rather than crashing.

### App component wiring

**Init:** Replace the existing `useState` initializer:
```js
// Before
const [workspaces, setWorkspaces] = React.useState(() =>
  JSON.parse(JSON.stringify(window.APP_DATA.WORKSPACES))
);

// After
const [workspaces, setWorkspaces] = React.useState(() => BBStorage.load());
```

**Auto-save:**
```js
React.useEffect(() => {
  BBStorage.save(workspaces);
}, [workspaces]);
```

Every state mutation (drag, edit, new task, delete) already flows through `setWorkspaces`, so this single effect covers all persistence automatically.

### Import / Export UI

Two icon buttons in the top bar (right side, before the nav tabs):
- **Export** (download icon): calls `BBStorage.exportJSON(workspaces)` immediately
- **Import** (upload icon): calls `BBStorage.importJSON(...)`, on success calls `setWorkspaces(imported)` and shows a brief toast ("Data imported — X workspaces loaded")

Reset all data is accessible via the workspace right-click context menu (see Workspace management in Full CRUD section).

### app-data.js after cleanup

The placeholder wholesale/agency data is removed. The file defines only the empty default structure used when no localStorage data exists:

```js
window.APP_DEFAULT = {
  workspaces: [
    {
      id: 'ws_default',
      name: 'My Workspace',
      abbr: 'MW',
      color: '#d4a017',
      areas: []
    }
  ]
};
```

---

## Phase 1: Full CRUD

### Workspace management

**Create:** A `+` button at the bottom of the workspace avatar list in the sidebar opens a small modal with two fields: Name and Abbreviation (2 chars, auto-derived from name but editable). Color is assigned from a preset palette of 8 colors in round-robin order. Saving adds the workspace to state with an empty `areas` array.

**Rename / Delete:** Right-clicking a workspace avatar opens a context menu with **Rename**, **Delete**, and **Reset all data**. Rename opens a small modal pre-filled with current name/abbr. Delete shows a confirmation modal: *"Delete [Workspace Name]? This permanently removes all areas, projects, and tasks inside."* Deleting the last workspace is blocked — the delete option is disabled with a tooltip: "At least one workspace is required." Reset all data requires a two-step confirmation ("Type RESET to confirm") before calling `BBStorage.clear()` and restoring the empty default.

### Area management

**Create:** Each area header in the sidebar has a `+` icon (visible on hover) that adds a new area below it. Name is entered inline — a text field replaces the header label, Enter confirms, Escape cancels. New area starts with an empty `projects` array.

**Rename:** Click the area name to edit inline. Enter to confirm, Escape to cancel.

**Delete:** A `···` menu on each area header (visible on hover) offers **Delete**. If the area contains projects, a confirmation modal warns: *"Delete [Area Name]? All projects and tasks inside will be removed."* Empty areas delete immediately without confirmation.

### Project management

**Create:** The existing "New Project" modal is updated to include a required **Area** dropdown (populated from the active workspace's areas). Fields: Name, Area, Status (active / planned), Start Date, End Date.

**Edit:** Each project in the sidebar and Board view gets a `···` context menu with **Edit** (opens the modal pre-filled) and **Delete** (confirmation required: *"Delete [Project Name]? All tasks inside will be removed."*).

**Archive:** A third status option — **Archive** — is available in the Edit modal and as a direct action in the `···` menu. Archived projects are hidden from all views by default (see Phase 3: Archive Projects).

### Task management

No structural changes. The existing create/edit/delete/move flow is complete. The notes auto-save fix is the only task-level change (see Phase 3: Task Notes).

---

## Phase 3: Core Features

### 1. Task notes auto-save fix

**Goal:** Notes must persist the moment they are typed — no explicit save action required.

**Fix:** Audit the notes textarea in TaskDrawer. Ensure it calls `onUpdate` on every `onChange` event with the full updated task object. If it currently defers to a save button or close action, change it to fire immediately. Since `onUpdate` flows into `setWorkspaces` which triggers auto-save, notes will persist to localStorage the moment they are typed.

### 2. Overdue task badges

**Computation:** A `useMemo` in App derives the overdue set from `workspaces` state — tasks where `due < today` (ISO date comparison) and `status !== 'done'`. The result is a map of `projectId → overdueCount`, passed down as a prop.

**Sidebar badges:** Each project row in the sidebar renders a small red pill (`background: #ef4444, color: #fff`) showing the overdue count when nonzero. Hidden when zero.

**Dashboard card:** A new "Overdue" card is added to the dashboard grid. When tasks are overdue, it lists them grouped by project — task title, due date, project name. Each task is clickable (opens drawer). When nothing is overdue, the card shows a green "All clear" state with a checkmark. The card does not appear if the active workspace has no tasks with due dates.

**Behavior:** Badges are live — they update in real time as tasks are marked done. No dismissal.

### 3. Drag to reorder within a column

**Current behavior:** Drag drops a task onto a column header or another task, changing `status` to the target column. Cross-column only.

**New behavior:** On same-column drop, the task is removed from its current index and inserted at the drop target's index in the tasks array. The `status` field is unchanged. On cross-column drop, existing behavior is preserved (status changes, task appended to bottom of target column).

**Implementation:** The drag handlers in `app-views.jsx` gain an `onReorderTask(projId, taskId, targetIndex)` handler alongside the existing `onMoveTask`. The drop target distinguishes same-column vs. cross-column drops by comparing the dragged task's current status against the target column's status.

### 4. Archive projects

**Status:** `archived` is added as a valid project status alongside `active` and `planned`.

**Hide/show:** By default all views (Dashboard, Board, Calendar, Roadmap) filter out archived projects. The sidebar workspace section includes a **"Show archived"** toggle (small text link at the bottom of the project list). When enabled, archived projects appear with reduced opacity (0.4) and an italic name.

**Archive action:** Available from the project `···` menu as "Archive project" and from the Edit modal's Status field. Un-archiving sets status back to `active`.

### 5. Search

**Entry point:** A magnifying glass icon in the top bar (left of export/import buttons). Clicking opens a full-width search panel that slides down below the top bar, overlaying the content area.

**Scope:** Searches across all workspaces simultaneously — project names, task titles, and task notes.

**Behavior:** Results appear as the user types (no debounce needed at this data size). Results are grouped: Workspace name → Project name → matching tasks. Each result row shows the task title and a snippet of matching text if it matched on notes.

**Navigation:** Clicking a result closes the search panel, switches to the correct workspace, and opens the task drawer for that task. Escape or clicking outside closes the panel without navigating.

---

## Implementation Order

1. `app-storage.js` — write the module, wire into `app-data.js` cleanup and `App` init/save
2. Import / Export UI — top bar buttons
3. Workspace CRUD — sidebar modal + context menu
4. Area CRUD — inline edit + `···` menu
5. Project CRUD — update existing modal + `···` menu + archive status
6. Task notes fix — `onChange` → `onUpdate` in TaskDrawer
7. Overdue badges — `useMemo` computation, sidebar pills, dashboard card
8. Drag reorder within column — extend drag handlers
9. Archive projects — filter logic + sidebar toggle
10. Search — top bar panel + result navigation
