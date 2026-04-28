# Handoff: BusinessBuild Ops — Project Management App

## Overview
BusinessBuild Ops is a solo-user project management app for building and systematizing a business — not day-to-day operations. It supports two separate workspaces (a real estate wholesale company and an automation tech agency), organized in a 3-level hierarchy: **Areas → Projects → Tasks**. The app has four views: Dashboard, Kanban Board, Calendar, and Roadmap/Timeline.

## About the Design Files
The files bundled here are **HTML design prototypes** — they show intended look, layout, and interactions. They are NOT production code to copy directly. The task is to **recreate these designs in your target codebase** using its established framework, libraries, and patterns. If no framework exists yet, Next.js + Tailwind + shadcn/ui is a solid fit for this type of app.

## Fidelity
**High-fidelity.** The prototype has final colors, typography, spacing, interactions, animations, and working state. Recreate the UI pixel-closely using your codebase's existing patterns and component system.

---

## Architecture

### Data Model
```
Workspace
  id, name, abbr, color
  areas: Area[]

Area
  id, name
  projects: Project[]

Project
  id, name, status ('active' | 'planned' | 'done')
  progress: number (0–100, auto-calculated from task completion)
  startDate, endDate (YYYY-MM-DD)
  tasks: Task[]

Task
  id, title
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due: string (YYYY-MM-DD)
  notes: string
```

### State Management
- `workspaces: Workspace[]` — full data tree, mutated immutably
- `activeWorkspaceId` — which workspace is shown
- `activeView` — 'dashboard' | 'kanban' | 'calendar' | 'roadmap'
- `selectedProjectId` — used by Kanban to pre-select a project
- `drawerTask` / `drawerProject` / `drawerArea` — currently open task in the detail drawer
- `showNewProjectModal` — boolean

**Project progress** auto-calculates: `Math.round(doneTasks / totalTasks * 100)`. Recalculate on every task mutation.

**Persistence:** Wire to localStorage (key: `bbops_workspaces`) so edits survive page reload. On first load, fall back to seed data if no localStorage entry exists.

---

## Layout

### Shell
```
┌──────────────┬──────────────────────────────────┐
│              │  Top Bar (52px)                   │
│  Sidebar     ├──────────────────────────────────┤
│  (220px)     │                                  │
│              │  View Content (fills remaining)  │
│              │                                  │
└──────────────┴──────────────────────────────────┘
```

### Sidebar (220px wide, full height)
- Background: sidebar color (dark, see tokens)
- Sections top to bottom:
  1. **Workspace header** (18px top padding): avatar (32×32px, 6px radius, workspace color bg, white 11px 700 abbr text) + workspace name (13px 600) + active task count (10px muted)
  2. **Workspace tabs** (below header, above divider): pill buttons per workspace, active has 1.5px colored border + slightly lighter bg
  3. **Nav views** (8px padding section): Dashboard ▦, Board ⊞, Calendar ⊟, Roadmap ▬ — 12px 500, active has accent dot on right edge + slightly lighter bg
  4. **Areas tree** (flex 1, scrollable): section label "AREAS" in 9px 700 mono uppercase; area rows with › chevron (rotates 90° when open); project rows indented 24px with 6px status dot + project name + task count
  5. **Footer**: "BUSINESSBUILD OPS" in 10px DM Mono, muted

---

## Views

### Dashboard
Layout: 32px padding, full scroll

**Stats row** — 4-column grid, 14px gap:
- Each card: 20px/22px padding, 14px radius, surface bg, card shadow
- Large number: 30px Syne 700, letterSpacing -0.03em
- Label: 12px 600
- Sub-label: 11px muted

**Main grid** — 2 columns (1.15fr / 0.85fr), 18px gap:

**All Projects panel** (left):
- 14px radius, surface bg, card shadow
- Header: 16px/20px padding, "ALL PROJECTS" 11px mono 700 muted + count right-aligned
- Each project row: 14px/20px padding, bottom border
  - Project name 13px 600 + StatusPill right-aligned
  - Area name 11px muted
  - Progress bar: 5px height, 3px radius, accent fill, progressBg track
  - Percentage: 10px mono muted, 32px width right-aligned

**Up Next panel** (right):
- Same card styling
- Each task row: 12px/20px padding, clickable (opens drawer on click)
- Task title 13px 500, lineHeight 1.35
- Priority badge + due date mono + StatusPill right-aligned
- Overdue tasks: due date turns amber/warning color with ⚠ prefix
- Hover: subtle background tint

**New Project button** (top right of page): 8px/16px padding, 8px radius, surface bg, border, 13px 500

### Kanban Board
Layout: 24px/28px padding, flex column, no outer scroll (columns scroll internally)

**Project selector** (above columns): "PROJECT" label 10px mono 700 muted + scrollable row of project pill buttons. Active pill: 1.5px accentBorder, accentMuted bg, text color. Inactive: border + muted text.

**3-column grid** (flex 1, 14px gap, overflow hidden):
Columns: To Do | In Progress | Done

Each column:
- Background: `columnBg` color
- 14px radius, 14px padding, 1.5px border (turns accent-tinted when drag target)
- Column header (bottom border): 8px dot (colored by status) + label 12px 700 + count 10px mono muted + `+` add button (22×22px, 5px radius)
- Cards scroll within column

**Task Card:**
- Surface bg, 10px radius, 12px/13px padding
- 1px border (turns warm amber if overdue)
- Box shadow, lifts on hover (translateY -1px, stronger shadow)
- Draggable (HTML5 drag API, `dataTransfer.setData('taskId', id)`)
- Drop zone: column `onDragOver` / `onDrop` to move task to that column's status
- Content: title 13px 500 → notes 11px muted (2-line clamp) → priority badge + due date + arrow buttons
- **← / → arrow buttons** (22×22px, 5px radius): move task to prev/next column. → button uses accentMuted bg + accentBorder. Stop propagation so click doesn't open drawer.
- Whole card click opens task drawer

**Columns accept drops:** `onDragOver` highlights with accent-tinted bg + border. `onDrop` calls `moveTask(projId, taskId, newStatus)`.

**+ button per column** opens `NewTaskModal` pre-set to that column's status.

### Calendar
Layout: 24px/28px padding, scrollable

- Month nav: ‹ / › buttons (32×32, 8px radius) + month title 18px Syne 700
- Day-of-week header: 7 columns, 10px mono 700 muted, 6px padding
- Calendar grid: 7 columns, 3px gap
- Each cell: surface bg, 1px border, 10px radius, 8px padding, min-height 88px; today cell gets accent-tinted bg + accent border
- Day number: 11px, bold + accent color if today
- Task chips: 10px, 4px radius, colored by status (done=green, in-progress=blue, todo=pillBg); clickable to open drawer; truncated with text-overflow ellipsis

### Roadmap / Timeline
Layout: 28px/32px padding, scrollable

- Date range: Mar 2026 → Sep 2026
- Left label column: 210px wide
- Month headers: positioned absolutely by percentage of total date range
- Today line: 2px wide, accent color, full column height
- Area labels: 9px mono 700 uppercase muted, 12px top padding
- Project rows: 40px height, label + bar
- Bar: positioned by startDate/endDate as % of range, 22px tall, 6px radius
  - Fill: `statusAccent + 18` (opacity) for bg, `statusAccent + 55` for border
  - Progress fill inside bar: `statusAccent + 35`
- Progress percentage: 38px column, right-aligned, 10px mono muted
- Legend at bottom: colored bars + labels

---

## Components

### StatusPill
Inline chip with rounded corners (borderRadius: 12px), 10px 600 text, 3px/8px padding.
- Done: green tint bg + green text
- In Progress: blue tint bg + blue text
- To Do / Planned: pillBg + muted text
- Active: blue tint (same as In Progress)

### Priority Badge
9px mono 700, uppercase, 4px radius, 2px/6px padding.
- HIGH: warm red tint
- MED: amber tint
- LOW: cool muted tint

### Task Drawer (right slide-in)
Width: 420px, full height, fixed position, right: 0.
Animation: `translateX(100%) → translateX(0)`, 0.22s cubic-bezier(0.22,1,0.36,1).
Backdrop: fixed inset, rgba(0,0,0,0.18), backdrop-filter blur(2px).

Sections:
1. **Header** (20px/24px padding, bottom border): breadcrumb (10px mono muted: AREA › Project) + editable title textarea (16px 600) + × close button
2. **Fields** (20px/24px padding, scrollable):
   - **Status**: 3 pill toggle buttons (To Do / In Progress / Done), active gets colored bg/border
   - **Priority**: 3 pill toggle buttons (low / medium / high), active gets colored bg/border
   - **Due Date**: native date input, 8px/10px padding, 8px radius
   - **Notes**: textarea, 5 rows, resizable vertically
   - Each field has a 10px mono 700 uppercase muted label above it
3. **Footer** (14px/24px padding, top border): "Delete task" text button (red/warning color) left + "Done" primary button right

On any field change → call `onUpdate(updatedTask)` immediately (no save button for fields).

### NewTaskModal
Centered modal, 480px wide, 16px radius, box-shadow.
Animation: `scale(0.94) → scale(1)`, 0.18s cubic-bezier.
Backdrop same as drawer.
Fields: Title (text input), Status (select), Priority (select), Due Date (date input), Notes (textarea).
Footer: Cancel + Save buttons.

### NewProjectModal
Same shell as NewTaskModal.
Fields: Project Name, Area (select from workspace areas), Start Date, End Date.

---

## Design Tokens

### Typography
- **Display / Headings**: Syne, weights 600/700/800 (Google Fonts)
- **Body / UI**: DM Sans, weights 400/500/600 (Google Fonts)
- **Mono / Labels**: DM Mono, weights 400/500 (Google Fonts)

### Colors — Light Theme (default, "Light")
```
bg:              #f0ede6   (warm off-white page background)
sidebar:         #1b1e2b   (dark slate)
sidebarBorder:   #242838
sidebarText:     #e4e1da
sidebarMuted:    #525a6a
sidebarActive:   #242838
surface:         #faf8f4   (warm white card/panel bg)
border:          rgba(0,0,0,0.07)
text:            #1c1a20
mutedText:       #9491a0
accent:          oklch(0.55 0.16 255)   (blue)
accentMuted:     oklch(0.55 0.16 255 / 0.08)
accentBorder:    oklch(0.55 0.16 255 / 0.3)
pillBg:          rgba(0,0,0,0.05)
progressBg:      #e8e4dc
columnBg:        #ebe8e0
cardShadow:      0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)
cardShadowHover: 0 4px 14px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)
hoverBg:         rgba(0,0,0,0.025)
```

### Colors — Dark Ops Theme
```
bg:              #0e1018
sidebar:         #12151f
surface:         #161a26
border:          #1e2438
text:            #e0ddd6
mutedText:       #525a6a
accent:          oklch(0.72 0.15 78)   (amber/gold)
columnBg:        #13161f
cardShadow:      0 1px 3px rgba(0,0,0,0.3)
```

### Colors — High Contrast Theme
```
bg:              #edebe4
sidebar:         #0a0a0a
surface:         #ffffff
border:          rgba(0,0,0,0.1)
text:            #0a0a0a
mutedText:       #7a7a7a
accent:          oklch(0.52 0.18 145)   (green)
columnBg:        #e6e3dc
```

### Status Colors (shared across themes)
```
done:        bg oklch(0.92 0.06 145), text oklch(0.45 0.15 145)   (green)
in-progress: bg oklch(0.92 0.06 250), text oklch(0.45 0.17 255)   (blue)
todo:        pillBg, mutedText
overdue:     border oklch(0.82 0.1 25), text oklch(0.55 0.18 25)  (amber warning)
```

### Priority Colors
```
high:   bg oklch(0.93 0.06 25),  text oklch(0.5 0.18 25)
medium: bg oklch(0.93 0.07 85),  text oklch(0.5 0.16 85)
low:    bg oklch(0.95 0.02 200), text oklch(0.6 0.08 200)
```

### Spacing & Shape
```
Sidebar width:   220px
Top bar height:  52px
Card radius:     10–14px
Modal radius:    16px
Drawer width:    420px
Column gap:      14px
Card padding:    12–14px
Page padding:    24–32px
```

---

## Interactions & Behavior

- **Workspace switch**: clicking a workspace tab resets selectedProject and closes any open drawer
- **Sidebar project click**: sets selectedProject + switches to Kanban view
- **Task card click**: opens drawer (from any view)
- **Drawer field edit**: immediately calls onUpdate, re-calculates project progress
- **Task delete**: removes from array, recalculates progress, closes drawer
- **Kanban drag**: HTML5 drag API. `draggable` on card. Column `onDragOver` sets hover state, `onDrop` calls moveTask
- **Arrow buttons on card**: ← moves to previous column status, → moves to next. `e.stopPropagation()` to prevent opening drawer
- **+ column button**: opens NewTaskModal pre-set to that column's status
- **New Project modal**: adds project to selected area
- **Calendar task chip click**: opens drawer
- **Progress bar**: auto-updates on any task status change across all views

---

## Suggested Next Features (not yet in prototype)
1. **localStorage persistence** — save/restore full workspaces tree on every mutation
2. **Weekly focus view** — cross-workspace list of in-progress + high priority tasks due this week
3. **Project detail page** — list view of all project tasks with inline status editing
4. **Notes/SOP field per project** — freeform text for process documentation
5. **PDF export** — roadmap or project list for weekly review
6. **Task count badges** on sidebar project rows

---

## Files in This Package
- `README.md` — this document
- `BusinessBuild Ops.html` — full working prototype (main app shell + App component)
- `app-data.js` — seed data (workspaces, areas, projects, tasks)
- `app-sidebar.jsx` — Sidebar component
- `app-views.jsx` — DashboardView, KanbanView, CalendarView, RoadmapView
- `app-drawer.jsx` — TaskDrawer, NewTaskModal, NewProjectModal
- `tweaks-panel.jsx` — Tweaks UI shell (not needed in production)
