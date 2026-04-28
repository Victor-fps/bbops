# BusinessBuild Ops — Neo's Noir Redesign Spec
**Date:** 2026-04-25  
**Status:** Approved  
**Scope:** Full visual replacement of all themes and views

---

## Background

The existing design uses three interchangeable themes (Dark Ops, Light Editorial, High Contrast) built around generic SaaS conventions — beige/navy palette, Syne + DM Sans typography, standard card grid. The user found it generic, bland, and visually flat.

The new design is inspired by the IQON "Neo's Noir" dashboard (Dribbble reference): pure black with a cosmic starfield, heavy-rounded card frames, a single cyan/teal accent, glowing green status dots, SVG ring gauges, and a premium "tool" personality. It replaces all three existing themes with one committed visual identity.

---

## Visual Design System

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `bg` | `#000` | Page background |
| `frame` | `#0b0c10` | Outer app frame, sidebar |
| `surface` | `#0d0f15` | Cards, columns, drawers |
| `border` | `rgba(255,255,255,0.05)` | Card/panel borders |
| `border-strong` | `rgba(255,255,255,0.10)` | Active states, hover |
| `text` | `#fff` | Primary text |
| `text-secondary` | `#aab0b8` | Body/list text |
| `text-muted` | `#5a6068` | Labels, captions |
| `accent` | `#00e5d4` | Rings, active nav, CTA buttons, rim-light |
| `accent-muted` | `rgba(0,229,212,0.12)` | Accent backgrounds |
| `status-green` | `#1de9b6` | Healthy/active status dots |
| `status-green-glow` | `0 0 6px rgba(29,233,182,0.6)` | Glowing dot shadow |
| `chart-purple` | `#c084fc` | Velocity sparkline only |
| `chart-purple-fill` | `rgba(168,85,247,0.3)` | Sparkline area fill |

### Starfield Overlay

Applied as a CSS `::before` pseudo-element on the root container using multiple `radial-gradient` points at random positions — 6–8 white dots at `0.2–0.4` opacity, `1px` size. Static (no animation).

### Outer Frame

```css
background: #0b0c10;
border-radius: 22px;
box-shadow:
  inset 0 0 0 1px rgba(255,255,255,0.04),
  inset 0 1px 0 rgba(255,255,255,0.06),
  0 30px 60px -20px rgba(0,0,0,0.8);
```

Rim-light arc at top via `::after`:
```css
position: absolute; top: -1px; left: 25%; right: 25%; height: 1px;
background: linear-gradient(90deg, transparent, rgba(0,229,212,0.55), transparent);
filter: blur(0.5px);
```

### Cards

```css
background: #0d0f15;
border: 1px solid rgba(255,255,255,0.05);
border-radius: 14px;
padding: 14–16px;
```

Hover state: border transitions to `rgba(255,255,255,0.10)`.

### Typography

| Role | Size | Weight | Color | Notes |
|---|---|---|---|---|
| App logo | 16px | 800 | #fff | `letter-spacing: 0.04em` |
| Page heading | 18px | 700 | #fff | `letter-spacing: -0.01em` |
| Welcome name | 36px | 700 | #fff | `letter-spacing: -0.02em`, italic span for accent word |
| Card title | 12–13px | 600 | #fff | — |
| Body/list | 10–11px | 400 | #aab0b8 | — |
| Section label | 8–9px | 600 | #4a5058 | Uppercase, `letter-spacing: 0.18em` |
| Ring center number | 11px | 600 | #fff | SVG `<text>` |

Font: **Inter** (system stack: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`). Removes Syne, DM Sans, DM Mono.

### Status Dots

```css
width: 7px; height: 7px; border-radius: 50%;
background: #1de9b6;
box-shadow: 0 0 6px rgba(29,233,182,0.6);
```

### Ring Gauge (SVG)

50×50 viewBox, two concentric `<circle>` elements:
- Track: `stroke: rgba(255,255,255,0.06)`, `stroke-width: 4`
- Fill: `stroke: #00e5d4`, `stroke-width: 4`, `stroke-linecap: round`, `stroke-dasharray: 125.6`, `stroke-dashoffset` calculated from `(1 - pct) * 125.6`
- Center `<text>`: count value

### Progress Bar

```css
height: 2px; background: rgba(255,255,255,0.06); border-radius: 2px;
/* fill */
background: linear-gradient(90deg, #00e5d4, #6ef0e3);
```

### Toggle Switches

28×14px pill, off: `rgba(255,255,255,0.08)`, on: `#1de9b6`. Knob: 10×10px white circle, shifts right when on.

### Theme Switcher / Tweaks Panel

**Removed entirely.** The `THEMES` object, `TWEAK_DEFAULTS`, and `TweaksPanel` / `TweakSection` / `TweakRadio` components are deleted. The `useTweaks` hook call in `App` is removed. Theme is hardcoded throughout.

---

## Components

### Sidebar (`app-sidebar.jsx`)

Full replacement. Structure top-to-bottom:

1. **Logo** — "BBOPS" + `beta` badge (cyan)
2. **Workspace card** — colored avatar (workspace.color), name, active task count, bordered panel
3. **Workspace tabs** — one button per workspace, colored dot, abbr, active = slightly lighter bg
4. **Section label** — "MAIN"
5. **Nav items** — Dashboard / Board / Calendar / Roadmap. Active: `rgba(255,255,255,0.04)` bg + `border: 1px solid rgba(255,255,255,0.08)`. Inactive: muted text, no bg.
6. **Section label** — "AREAS"
7. **Areas + projects** — area row with chevron collapse, project sub-rows indented, active project row has cyan left-border accent
8. **Bottom section** — static "Neo's Noir" label (replacing theme switcher) + "Need a system?" help card with cyan CTA button

Width: 200px (reduced from 220px).

### Dashboard View (`app-views.jsx` — DashboardView)

7-card CSS grid (`grid-template-columns: 1.4fr 1fr 1fr 1fr`):

Grid layout: 3 rows.

**Row 1** (`grid-template-columns: 1.4fr 1fr 1fr 1fr`):

| # | Card | Grid span | Content |
|---|---|---|---|
| 1 | Welcome hero | col 1, rows 1–2 | Big name, italic tagline, top 3 active project status rows, "Open Board ›" button |
| 2 | Open Tasks | col 2, row 1 | Ring gauge (count), progress bar, `calcProgress` across all tasks |
| 3 | In Progress | col 3, row 1 | Number card, count, `+/−` vs prior week label |
| 4 | Completed | col 4, row 1 | Number card, count, % completion rate |

**Row 2:**

| # | Card | Grid span | Content |
|---|---|---|---|
| 5 | Velocity | cols 2–3, row 2 | SVG sparkline — **static hardcoded points** (app has no historical data). 16 data points trending upward. Purple `#c084fc` line + fill. "Trending up" status dot. |
| 6 | Upcoming This Week | col 4, row 2 | List of next 7 non-done tasks sorted by `due`, each row: dot + title + priority chip + date |

**Row 3** (full width, `grid-column: 1 / -1`):

| # | Card | Grid span | Content |
|---|---|---|---|
| 7 | Active Projects | all 4 cols | Top 5 active projects in a horizontal row: each sub-card shows project name, area label, Noir progress bar, status dot, % complete |

Stats derived from existing `workspace` prop — no data model changes.

### Kanban View (`app-views.jsx` — KanbanView)

Visual reskin only:
- Column background: `#0d0f15`, top accent bar in `#00e5d4` on hovered/active column
- Task cards: surface `#0d0f15` → on hover `border-color: rgba(255,255,255,0.10)`
- Priority chips: reskinned to Noir palette (high = `rgba(244,117,117,0.12)` / `#f47575`, medium = `rgba(138,130,245,0.12)` / `#8a82f5`, low = muted)
- "Add task" row: muted dashed bottom border, `#5a6068` text
- No structural changes to drag logic or column layout

### Calendar View (`app-views.jsx` — CalendarView)

Visual reskin:
- Grid lines: `rgba(255,255,255,0.04)`
- Today highlight: `accent-muted` background + `#00e5d4` border
- Event chips: surface card treatment, status dots
- Header/nav buttons: Noir card style

### Roadmap View (`app-views.jsx` — RoadmapView)

Visual reskin:
- Timeline bar: `#1de9b6` fill, `rgba(255,255,255,0.06)` track
- Today line: `#00e5d4` dashed vertical
- Row backgrounds alternate between `#000` and `rgba(255,255,255,0.01)`

### Task Drawer (`app-drawer.jsx`)

Visual reskin:
- Panel: `background: #0d0f15`, `border-left: 1px solid rgba(255,255,255,0.08)`, no border-radius on left edge
- Priority and status components: Noir palette
- Inputs/textareas: `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.08)`

### New Project Modal (`app-drawer.jsx` or inline)

Visual reskin:
- Backdrop: `rgba(0,0,0,0.75)`
- Panel: `#0d0f15`, `border-radius: 18px`, `border: 1px solid rgba(255,255,255,0.08)`
- Inputs: same as drawer inputs

---

## Files Changed

| File | Change type |
|---|---|
| `BusinessBuild Ops.html` | Remove `THEMES`, `TWEAK_DEFAULTS`, all theme-related JSX in `App`. Hardcode Noir tokens. Remove `TweaksPanel` block. Remove font imports (Syne, DM Sans, DM Mono) — replace with Inter. |
| `app-sidebar.jsx` | Full replacement of component + styles |
| `app-views.jsx` | DashboardView full replacement; KanbanView, CalendarView, RoadmapView visual reskin |
| `app-drawer.jsx` | Visual reskin of TaskDrawer and NewProjectModal |
| `tweaks-panel.jsx` | **Delete the file.** Also remove its `<script src="tweaks-panel.jsx">` tag from `BusinessBuild Ops.html`. |

---

## Out of Scope

- Data model changes (tasks, projects, workspaces structure unchanged)
- Drag-and-drop logic changes
- New views or features
- Responsive / mobile layout
- Animations beyond existing CSS transitions
