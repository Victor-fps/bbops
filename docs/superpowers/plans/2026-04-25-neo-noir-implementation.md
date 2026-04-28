# Neo's Noir Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all three existing themes with a single "Neo's Noir" dark design system across all views.

**Architecture:** Define a single `NOIR` token object that maps to the existing `theme` prop interface, so all components receive correct values without structural changes. The DashboardView is fully rebuilt with a 7-card grid. All other views receive targeted color fixes. The theme/tweaks system is deleted entirely.

**Tech Stack:** React 18 (CDN/UMD), Babel Standalone, vanilla CSS-in-JS inline styles, no bundler or test runner. Verification is visual — open `BusinessBuild Ops.html` in browser after each task and confirm the result.

---

## File Map

| File | Action |
|---|---|
| `BusinessBuild Ops.html` | Remove THEMES + TweaksPanel + Syne/DM fonts; add Inter; define `NOIR`; simplify `App` |
| `app-sidebar.jsx` | Full replacement with Noir sidebar |
| `app-views.jsx` | Full replacement of `DashboardView`; targeted color fixes in KanbanView, CalendarView, RoadmapView |
| `app-drawer.jsx` | Targeted color + font fixes in TaskDrawer, ModalShell, drawerInputStyle, DrawerField |
| `tweaks-panel.jsx` | Delete file |

---

## Task 1: Replace Font Imports, Define NOIR Token, Remove Theme System

**Files:**
- Modify: `BusinessBuild Ops.html`

- [ ] **Step 1: Replace the Google Fonts link**

Find this block in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Replace with:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Also update the `body` font-family in the `<style>` block:
```css
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; overflow: hidden; }
```

- [ ] **Step 2: Remove the tweaks-panel script tag**

Find and delete this line in `<body>`:
```html
<script type="text/babel" src="tweaks-panel.jsx"></script>
```

- [ ] **Step 3: Replace the THEMES object and TWEAK_DEFAULTS with the NOIR constant**

Find and delete everything from `const THEMES = {` through the closing `};` of `TWEAK_DEFAULTS` (lines ~34–105).

Replace with:
```js
const NOIR = {
  // Layout
  bg: '#000',
  sidebar: '#0b0c10',
  sidebarBorder: 'rgba(255,255,255,0.05)',
  sidebarText: '#fff',
  sidebarMuted: '#5a6068',
  sidebarActive: 'rgba(255,255,255,0.06)',
  surface: '#0d0f15',
  border: 'rgba(255,255,255,0.05)',
  // Text
  text: '#fff',
  mutedText: '#5a6068',
  // Accent
  accent: '#00e5d4',
  accentMuted: 'rgba(0,229,212,0.12)',
  accentBorder: 'rgba(0,229,212,0.35)',
  // Misc surfaces
  pillBg: 'rgba(255,255,255,0.06)',
  progressBg: 'rgba(255,255,255,0.06)',
  columnBg: '#0d0f15',
  cardShadow: '0 1px 4px rgba(0,0,0,0.5)',
  cardShadowHover: '0 4px 20px rgba(0,0,0,0.6)',
  hoverBg: 'rgba(255,255,255,0.03)',
};
```

- [ ] **Step 4: Simplify the App component — remove useTweaks and TweaksPanel**

Find in `App()`:
```js
const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
const theme = THEMES[tweaks.theme] || THEMES.lightEditorial;
```

Replace with:
```js
const theme = NOIR;
```

Then find and delete the entire `<TweaksPanel>` block at the bottom of the App JSX (the section starting with `{/* Tweaks */}` through `</TweaksPanel>`):
```jsx
{/* Tweaks */}
<TweaksPanel>
  <TweakSection title="Theme">
    <TweakRadio id="theme" label="Color scheme" value={tweaks.theme}
      onChange={v => setTweak('theme', v)}
      options={[
        { value: 'darkOps', label: 'Dark Ops' },
        { value: 'lightEditorial', label: 'Light' },
        { value: 'boldContrast', label: 'High Contrast' },
      ]} />
  </TweakSection>
</TweaksPanel>
```

- [ ] **Step 5: Add starfield background to the root container**

In the App return, find the outer wrapper div:
```jsx
<div style={{ display: 'flex', height: '100vh', background: theme.bg, fontFamily: "'DM Sans', sans-serif" }}>
```

Replace with:
```jsx
<div style={{
  display: 'flex', height: '100vh',
  background: `radial-gradient(ellipse at 20% 10%, #0a0e14 0%, #000 60%)`,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  position: 'relative',
}}>
  {/* Starfield */}
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: `
      radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.4), transparent 50%),
      radial-gradient(1px 1px at 28% 60%, rgba(255,255,255,0.25), transparent 50%),
      radial-gradient(1px 1px at 47% 22%, rgba(255,255,255,0.3), transparent 50%),
      radial-gradient(1px 1px at 73% 70%, rgba(255,255,255,0.35), transparent 50%),
      radial-gradient(1px 1px at 88% 33%, rgba(255,255,255,0.25), transparent 50%),
      radial-gradient(1px 1px at 35% 88%, rgba(255,255,255,0.2), transparent 50%),
      radial-gradient(1px 1px at 61% 45%, rgba(255,255,255,0.3), transparent 50%),
      radial-gradient(1px 1px at 91% 78%, rgba(255,255,255,0.2), transparent 50%)
    `,
  }} />
```

Also add `position: 'relative', zIndex: 1` to the `<Sidebar>` wrapper and the main content wrapper so they sit above the starfield.

Note: The closing `</div>` at the very end of the App return closes this new outer div, so don't add an extra one.

- [ ] **Step 6: Open `BusinessBuild Ops.html` in a browser and verify**

Expected: App loads in dark/black theme. Sidebar is dark, cards have dark surface, cyan accent visible on active nav item and buttons. No tweaks panel in the bottom-right corner. Inter font in use (compare to before — rounded 'a', slightly different numerals).

---

## Task 2: Replace the Sidebar

**Files:**
- Modify: `app-sidebar.jsx` (full replacement)

- [ ] **Step 1: Replace the entire contents of `app-sidebar.jsx` with the following**

```jsx
// Sidebar — Neo's Noir

function Sidebar({ workspace, workspaces, onSwitchWorkspace, selectedProject, onSelectProject, activeView, onSetView, theme }) {
  const [expandedAreas, setExpandedAreas] = React.useState(() => {
    const init = {};
    workspace.areas.forEach(a => { init[a.id] = true; });
    return init;
  });
  const toggleArea = (id) => setExpandedAreas(prev => ({ ...prev, [id]: !prev[id] }));

  const allTasks = workspace.areas.flatMap(a => a.projects.flatMap(p => p.tasks));
  const activeCount = allTasks.filter(t => t.status === 'in-progress').length;

  const views = [
    { id: 'dashboard', label: 'Dashboard', icon: '▦' },
    { id: 'kanban',    label: 'Board',     icon: '⊞' },
    { id: 'calendar',  label: 'Calendar',  icon: '⊟' },
    { id: 'roadmap',   label: 'Roadmap',   icon: '▬' },
  ];

  return (
    <div style={{
      width: 200, minWidth: 200, height: '100vh',
      background: '#0b0c10',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0, position: 'relative', zIndex: 1,
    }}>
      {/* Rim-light arc */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(0,229,212,0.4), transparent)',
        filter: 'blur(0.5px)',
      }} />

      {/* Logo */}
      <div style={{ padding: '18px 16px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>BBOPS</span>
        <span style={{
          fontSize: 8, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
          background: 'rgba(0,229,212,0.12)', color: '#00e5d4', letterSpacing: '0.05em',
        }}>beta</span>
      </div>

      {/* Workspace card */}
      <div style={{ margin: '0 10px 10px', padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          background: workspace.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: '#000',
        }}>{workspace.abbr}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{workspace.name}</div>
          <div style={{ fontSize: 9, color: '#5a6068', marginTop: 1 }}>{activeCount} in progress</div>
        </div>
      </div>

      {/* Workspace tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '0 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {workspaces.map(ws => (
          <button key={ws.id} onClick={() => onSwitchWorkspace(ws.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 8px', borderRadius: 6,
              border: ws.id === workspace.id ? `1.5px solid ${ws.color}60` : '1.5px solid transparent',
              background: ws.id === workspace.id ? 'rgba(255,255,255,0.04)' : 'transparent',
              color: ws.id === workspace.id ? '#fff' : '#5a6068',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: ws.color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>{ws.abbr}</span>
          </button>
        ))}
      </div>

      {/* Nav views */}
      <div style={{ padding: '8px 6px 4px' }}>
        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', color: '#4a5058', padding: '4px 8px 6px', fontFamily: 'inherit' }}>MAIN</div>
        {views.map(v => {
          const on = activeView === v.id;
          return (
            <button key={v.id} onClick={() => onSetView(v.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '7px 10px', borderRadius: 8,
                border: on ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                background: on ? 'rgba(255,255,255,0.04)' : 'transparent',
                color: on ? '#fff' : '#5a6068',
                fontSize: 12, fontWeight: on ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
                marginBottom: 1, transition: 'all 0.1s',
              }}>
              <span style={{ fontSize: 12, width: 14, textAlign: 'center', opacity: 0.8 }}>{v.icon}</span>
              {v.label}
              {on && <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#00e5d4', boxShadow: '0 0 5px rgba(0,229,212,0.6)' }} />}
            </button>
          );
        })}
      </div>

      {/* Areas + Projects */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', color: '#4a5058', padding: '4px 8px 6px', fontFamily: 'inherit' }}>AREAS</div>
        {workspace.areas.map(area => (
          <div key={area.id}>
            <button onClick={() => toggleArea(area.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                width: '100%', padding: '5px 10px', border: 'none',
                background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
              }}>
              <span style={{ fontSize: 11, color: '#5a6068', display: 'inline-block', transition: 'transform 0.15s', transform: expandedAreas[area.id] ? 'rotate(90deg)' : 'rotate(0deg)', width: 10 }}>›</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#aab0b8', letterSpacing: '0.03em' }}>{area.name}</span>
            </button>
            {expandedAreas[area.id] && area.projects.map(proj => {
              const on = selectedProject === proj.id;
              return (
                <button key={proj.id} onClick={() => onSelectProject(proj.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    width: 'calc(100% - 8px)', margin: '1px 4px',
                    padding: '5px 8px 5px 22px',
                    border: 'none',
                    borderLeft: on ? '2px solid #00e5d4' : '2px solid transparent',
                    background: on ? 'rgba(255,255,255,0.04)' : 'transparent',
                    color: on ? '#fff' : '#5a6068',
                    cursor: 'pointer', fontFamily: 'inherit',
                    borderRadius: '0 6px 6px 0', transition: 'all 0.1s',
                  }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: proj.status === 'active' ? '#1de9b6' : proj.status === 'done' ? '#5a6068' : '#3a4048', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, flex: 1, textAlign: 'left', lineHeight: 1.3 }}>{proj.name}</span>
                  <span style={{ fontSize: 9, color: '#4a5058' }}>{proj.tasks.length}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 10,
        }}>
          <span style={{ fontSize: 9, color: '#aab0b8' }}>Theme</span>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 500 }}>Neo's Noir</span>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, padding: '10px 12px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>Need a system?</div>
          <div style={{ fontSize: 9, color: '#5a6068', marginTop: 2 }}>Pre-built SOP packs available</div>
          <button style={{
            marginTop: 8, width: '100%', background: '#00e5d4', border: 'none',
            color: '#001a17', fontSize: 10, fontWeight: 700, padding: '7px',
            borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
          }}>Browse library</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar });
```

- [ ] **Step 2: Verify in browser**

Expected: Left sidebar shows BBOPS logo with cyan beta badge, dark workspace card, workspace tab switcher, nav items with active pill + glowing cyan dot, collapsible areas + projects (active project has cyan left border), bottom static theme label + green "Browse library" CTA.

---

## Task 3: Replace DashboardView

**Files:**
- Modify: `app-views.jsx` — replace `DashboardView` function only, and update `priorityBadge` + `StatusPill`

- [ ] **Step 1: Replace `priorityBadge` helper**

Find the `priorityBadge` function (lines 4–18) and replace with:
```jsx
function priorityBadge(priority) {
  const cfg = {
    high:   { label: 'HIGH', bg: 'rgba(244,117,117,0.12)', color: '#f47575' },
    medium: { label: 'MED',  bg: 'rgba(138,130,245,0.12)', color: '#8a82f5' },
    low:    { label: 'LOW',  bg: 'rgba(255,255,255,0.05)', color: '#5a6068' },
  };
  const c = cfg[priority] || cfg.low;
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.07em',
      background: c.bg, color: c.color,
      padding: '2px 6px', borderRadius: 4, fontFamily: 'inherit',
    }}>{c.label}</span>
  );
}
```

- [ ] **Step 2: Replace `StatusPill` helper**

Find the `StatusPill` function and replace with:
```jsx
function StatusPill({ status }) {
  const cfg = {
    'done':        { label: 'Done',        bg: 'rgba(29,233,182,0.12)',  color: '#1de9b6' },
    'in-progress': { label: 'In Progress', bg: 'rgba(0,229,212,0.12)',   color: '#00e5d4' },
    'todo':        { label: 'To Do',       bg: 'rgba(255,255,255,0.05)', color: '#5a6068' },
    'active':      { label: 'Active',      bg: 'rgba(0,229,212,0.12)',   color: '#00e5d4' },
    'planned':     { label: 'Planned',     bg: 'rgba(255,255,255,0.05)', color: '#5a6068' },
  };
  const c = cfg[status] || cfg.todo;
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '0.03em',
      background: c.bg, color: c.color,
      padding: '3px 8px', borderRadius: 12,
    }}>{c.label}</span>
  );
}
```

Note: `theme` param removed — StatusPill now hardcodes Noir colors. Update all existing call sites that pass `theme={theme}` by removing that prop (they're in DashboardView old code which we're replacing, and in KanbanCard/drawer which we fix in Tasks 4 and 7).

- [ ] **Step 3: Replace the entire `DashboardView` function**

Find `function DashboardView(` through its closing `}` and replace with:

```jsx
function RingGauge({ value, total, size = 54 }) {
  const pct = total > 0 ? value / total : 0;
  const circumference = 2 * Math.PI * 20;
  const offset = circumference * (1 - pct);
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" style={{ flexShrink: 0 }}>
      <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle cx="25" cy="25" r="20" fill="none" stroke="#00e5d4" strokeWidth="4"
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        transform="rotate(-90 25 25)" />
      <text x="25" y="30" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600"
        fontFamily="Inter, sans-serif">{value}</text>
    </svg>
  );
}

const VELOCITY_POINTS = [40, 38, 34, 36, 30, 31, 24, 26, 20, 22, 17, 23, 14, 19, 9, 14];

function VelocitySparkline() {
  const w = 300, h = 52;
  const min = Math.min(...VELOCITY_POINTS), max = Math.max(...VELOCITY_POINTS);
  const range = max - min || 1;
  const pts = VELOCITY_POINTS.map((v, i) => {
    const x = (i / (VELOCITY_POINTS.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  });
  const polyline = pts.join(' L ');
  const area = `M ${pts[0]} L ${polyline} L ${w},${h} L 0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h }}>
      <defs>
        <linearGradient id="vel-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#vel-fill)" />
      <polyline points={pts.join(' ')} fill="none" stroke="#c084fc" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardView({ workspace, theme, onOpenTask, onNewProject }) {
  const allProjects = workspace.areas.flatMap(a => a.projects.map(p => ({ ...p, areaName: a.name })));
  const allTasks = allProjects.flatMap(p => p.tasks);

  const openCount = allTasks.filter(t => t.status !== 'done').length;
  const inProgressCount = allTasks.filter(t => t.status === 'in-progress').length;
  const doneCount = allTasks.filter(t => t.status === 'done').length;
  const doneRate = allTasks.length > 0 ? Math.round(doneCount / allTasks.length * 100) : 0;
  const openRate = allTasks.length > 0 ? Math.round(openCount / allTasks.length * 100) : 0;

  const upcoming = allTasks
    .filter(t => t.status !== 'done' && t.due)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 7);

  const activeProjects = allProjects
    .filter(p => p.status === 'active')
    .slice(0, 5);

  const topStatusProjects = allProjects
    .filter(p => p.status === 'active')
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  const taskProject = (t) => allProjects.find(p => p.tasks.find(x => x.id === t.id));

  const card = {
    background: '#0d0f15',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: '16px',
  };

  const statusDot = (color = '#1de9b6') => ({
    width: 7, height: 7, borderRadius: '50%',
    background: color, flexShrink: 0,
    boxShadow: `0 0 6px ${color}99`,
  });

  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', height: '100%' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        gap: 12,
      }}>

        {/* 1. Welcome Hero — spans rows 1–2 */}
        <div style={{
          ...card,
          gridRow: '1 / 3',
          display: 'flex', flexDirection: 'column', gap: 10,
          position: 'relative', overflow: 'hidden',
          padding: '20px',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 80%, rgba(0,229,212,0.1), transparent 55%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: '#5a6068' }}>OPERATOR</div>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
            Victor.
          </div>
          <div style={{ fontSize: 22, fontWeight: 400, color: '#00e5d4', fontStyle: 'italic', lineHeight: 1.1 }}>
            Build the<br />machine.
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
            {topStatusProjects.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={statusDot()} />
                <span style={{ color: '#fff', fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                <span style={{ color: '#5a6068', fontSize: 9, whiteSpace: 'nowrap' }}>{p.progress}%</span>
              </div>
            ))}
          </div>
          <button onClick={() => onNewProject && onNewProject()}
            style={{
              marginTop: 10, alignSelf: 'flex-start',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 11, padding: '7px 14px', borderRadius: 999,
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
              position: 'relative', zIndex: 1,
            }}>+ New Project</button>
        </div>

        {/* 2. Open Tasks ring */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: '#5a6068' }}>OPEN TASKS</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{openCount}</div>
              <div style={{ fontSize: 9, color: '#5a6068', marginTop: 4 }}>across {allProjects.length} projects</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 9, color: '#1de9b6' }}>
                <span style={statusDot()} />On track
              </div>
            </div>
            <RingGauge value={doneCount} total={allTasks.length} />
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <div style={{ fontSize: 8, color: '#5a6068', letterSpacing: '0.1em', marginBottom: 4 }}>PROGRESS</div>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${doneRate}%`, height: '100%', background: 'linear-gradient(90deg, #00e5d4, #6ef0e3)', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 9, color: '#aab0b8', textAlign: 'right', marginTop: 3 }}>{doneRate}%</div>
          </div>
        </div>

        {/* 3. In Progress */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: '#5a6068' }}>IN PROGRESS</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{inProgressCount}</div>
          <div style={{ fontSize: 9, color: '#5a6068' }}>tasks right now</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, fontSize: 9, color: '#1de9b6' }}>
            <span style={statusDot()} />Active
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <div style={{ fontSize: 8, color: '#5a6068', letterSpacing: '0.1em', marginBottom: 4 }}>VELOCITY</div>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${allTasks.length ? Math.round(inProgressCount / allTasks.length * 100) : 0}%`, height: '100%', background: 'linear-gradient(90deg, #00e5d4, #6ef0e3)', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 9, color: '#aab0b8', textAlign: 'right', marginTop: 3 }}>{allTasks.length ? Math.round(inProgressCount / allTasks.length * 100) : 0}%</div>
          </div>
        </div>

        {/* 4. Completed */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: '#5a6068' }}>COMPLETED</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{doneCount}</div>
          <div style={{ fontSize: 9, color: '#5a6068' }}>tasks closed</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, fontSize: 9, color: '#1de9b6' }}>
            <span style={statusDot()} />{doneRate}% rate
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <div style={{ fontSize: 8, color: '#5a6068', letterSpacing: '0.1em', marginBottom: 4 }}>RATE</div>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${doneRate}%`, height: '100%', background: 'linear-gradient(90deg, #00e5d4, #6ef0e3)', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 9, color: '#aab0b8', textAlign: 'right', marginTop: 3 }}>{doneRate}%</div>
          </div>
        </div>

        {/* 5. Velocity sparkline — cols 2–3 */}
        <div style={{ ...card, gridColumn: '2 / 4' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Velocity</div>
              <div style={{ fontSize: 9, color: '#5a6068', marginTop: 2 }}>tasks closed · last 30 days</div>
            </div>
            <div style={{ fontSize: 9, color: '#5a6068', textAlign: 'right' }}>
              <span style={{ color: '#c084fc', fontWeight: 600 }}>+18%</span><br />vs prev 30d
            </div>
          </div>
          <VelocitySparkline />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 9, color: '#1de9b6' }}>
            <span style={statusDot()} />Trending up
          </div>
        </div>

        {/* 6. Upcoming This Week — col 4 */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>Upcoming</div>
            <div style={{ fontSize: 9, color: '#5a6068', marginTop: 1 }}>next 7 due tasks</div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 200 }}>
            {upcoming.map((t, i) => {
              const overdue = isOverdue(t.due);
              return (
                <div key={t.id}
                  onClick={() => onOpenTask && onOpenTask(t, taskProject(t))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px',
                    borderBottom: i < upcoming.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ ...statusDot(overdue ? '#f47575' : '#1de9b6') }} />
                  <span style={{ flex: 1, fontSize: 10, color: '#d0d4da', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  <span style={{ fontSize: 9, color: overdue ? '#f47575' : '#5a6068', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(t.due)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Active Projects — full width row 3 */}
        <div style={{ ...card, gridColumn: '1 / -1', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Active Projects</div>
            <div style={{ fontSize: 9, color: '#5a6068' }}>{activeProjects.length} projects</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeProjects.length}, 1fr)`, gap: 10 }}>
            {activeProjects.map(p => (
              <div key={p.id} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={statusDot()} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                </div>
                <div style={{ fontSize: 9, color: '#5a6068', marginBottom: 8 }}>{p.areaName}</div>
                <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ width: `${p.progress}%`, height: '100%', background: 'linear-gradient(90deg, #00e5d4, #6ef0e3)' }} />
                </div>
                <div style={{ fontSize: 9, color: '#aab0b8', textAlign: 'right' }}>{p.progress}%</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser — switch to Dashboard tab**

Expected: 7-card grid with Welcome hero (top-left, spanning 2 rows), three stat cards (Open Tasks with ring gauge, In Progress, Completed), purple velocity sparkline (cols 2–3), Upcoming This Week list (col 4), and Active Projects horizontal strip at the bottom.

---

## Task 4: Reskin KanbanView

**Files:**
- Modify: `app-views.jsx` — update `COL_ACCENTS`, `KanbanCard`, `arrowBtnStyle`, and `StatusPill` call sites

- [ ] **Step 1: Update `COL_ACCENTS`**

Find:
```js
const COL_ACCENTS = { 'todo': null, 'in-progress': 'oklch(0.65 0.15 250)', 'done': 'oklch(0.65 0.15 145)' };
```

Replace with:
```js
const COL_ACCENTS = { 'todo': '#5a6068', 'in-progress': '#00e5d4', 'done': '#1de9b6' };
```

- [ ] **Step 2: Update `KanbanCard` — fix overdue color and StatusPill call**

Find in `KanbanCard`:
```jsx
border: `1px solid ${overdue ? 'oklch(0.82 0.1 25)' : theme.border}`,
```
Replace with:
```jsx
border: `1px solid ${overdue ? 'rgba(244,117,117,0.5)' : 'rgba(255,255,255,0.05)'}`,
```

Find:
```jsx
color: overdue ? 'oklch(0.55 0.18 25)' : theme.mutedText, marginLeft: 2
```
Replace with:
```jsx
color: overdue ? '#f47575' : '#5a6068', marginLeft: 2
```

- [ ] **Step 3: Update `arrowBtnStyle` — fix accent forward arrow**

Find in `KanbanCard` the forward arrow button:
```jsx
style={{ ...arrowBtnStyle(theme), background: theme.accentMuted, borderColor: theme.accentBorder, color: theme.accent }}
```
Replace with:
```jsx
style={{ ...arrowBtnStyle(theme), background: 'rgba(0,229,212,0.12)', borderColor: 'rgba(0,229,212,0.35)', color: '#00e5d4' }}
```

- [ ] **Step 4: Verify in browser — switch to Board tab**

Expected: Three dark columns with Noir surface, cyan/green column header dots, cards with dark surface and Noir priority badges, forward arrow button has cyan accent.

---

## Task 5: Reskin CalendarView

**Files:**
- Modify: `app-views.jsx` — update `CalendarView` and `calNavBtn`

- [ ] **Step 1: Fix the month heading font reference**

Find in `CalendarView`:
```jsx
fontFamily: 'Syne, sans-serif'
```
Replace with:
```jsx
fontFamily: 'Inter, sans-serif'
```

- [ ] **Step 2: Fix the weekday labels font reference**

Find:
```jsx
fontFamily: 'DM Mono, monospace'
```
In `CalendarView` (there are two — weekday headers and `calNavBtn`). Replace both with:
```jsx
fontFamily: 'inherit'
```

- [ ] **Step 3: Fix task chip colors inside calendar cells**

Find in `CalendarView` the task chip style:
```jsx
background: t.status === 'done' ? 'oklch(0.92 0.06 145)' : t.status === 'in-progress' ? 'oklch(0.92 0.06 250)' : theme.pillBg,
color: t.status === 'done' ? 'oklch(0.45 0.15 145)' : t.status === 'in-progress' ? 'oklch(0.45 0.17 255)' : theme.mutedText,
```
Replace with:
```jsx
background: t.status === 'done' ? 'rgba(29,233,182,0.12)' : t.status === 'in-progress' ? 'rgba(0,229,212,0.12)' : 'rgba(255,255,255,0.05)',
color: t.status === 'done' ? '#1de9b6' : t.status === 'in-progress' ? '#00e5d4' : '#5a6068',
```

- [ ] **Step 4: Verify in browser — switch to Calendar tab**

Expected: Dark calendar grid, today's cell highlighted with cyan border and muted cyan background, task chips in Noir green/cyan/muted colors, month nav buttons in dark Noir style.

---

## Task 6: Reskin RoadmapView + Delete tweaks-panel.jsx

**Files:**
- Modify: `app-views.jsx` — update `RoadmapView` font references
- Modify: `app-views.jsx` — update `statusAccent`
- Delete: `tweaks-panel.jsx`

- [ ] **Step 1: Fix `statusAccent` in `RoadmapView`**

Find:
```js
const statusAccent = (s) => s === 'active' ? theme.accent : s === 'done' ? 'oklch(0.65 0.15 145)' : theme.mutedText;
```
Replace with:
```js
const statusAccent = (s) => s === 'active' ? '#00e5d4' : s === 'done' ? '#1de9b6' : '#5a6068';
```

- [ ] **Step 2: Fix font references in `RoadmapView`**

Find all occurrences of `fontFamily: 'DM Mono, monospace'` inside `RoadmapView` (there are ~3). Replace each with:
```jsx
fontFamily: 'inherit'
```

- [ ] **Step 3: Delete `tweaks-panel.jsx`**

```bash
rm "/Users/yanaboo/Downloads/design_handoff_businessbuild_ops/tweaks-panel.jsx"
```

- [ ] **Step 4: Verify in browser — switch to Roadmap tab**

Expected: Roadmap rows with cyan active bars, green done bars, muted planned bars. Today vertical line is cyan. No console errors from missing tweaks-panel.jsx.

---

## Task 7: Reskin Task Drawer and Modals

**Files:**
- Modify: `app-drawer.jsx` — update status/priority colors, font references, input styles

- [ ] **Step 1: Replace `statusColors` in `TaskDrawer`**

Find:
```js
const statusColors = {
  'todo':        { bg: theme.pillBg,                    color: theme.mutedText,           border: theme.border },
  'in-progress': { bg: 'oklch(0.92 0.06 250)',          color: 'oklch(0.45 0.17 255)',    border: 'oklch(0.8 0.1 255)' },
  'done':        { bg: 'oklch(0.92 0.06 145)',          color: 'oklch(0.45 0.15 145)',    border: 'oklch(0.8 0.1 145)' },
};
```
Replace with:
```js
const statusColors = {
  'todo':        { bg: 'rgba(255,255,255,0.05)', color: '#5a6068',  border: 'rgba(255,255,255,0.1)' },
  'in-progress': { bg: 'rgba(0,229,212,0.12)',   color: '#00e5d4',  border: 'rgba(0,229,212,0.35)' },
  'done':        { bg: 'rgba(29,233,182,0.12)',  color: '#1de9b6',  border: 'rgba(29,233,182,0.35)' },
};
```

- [ ] **Step 2: Replace `priorityColors` in `TaskDrawer`**

Find:
```js
const priorityColors = {
  high:   { bg: 'oklch(0.93 0.06 25)',  color: 'oklch(0.5 0.18 25)',  border: 'oklch(0.82 0.1 25)' },
  medium: { bg: 'oklch(0.93 0.07 85)',  color: 'oklch(0.5 0.16 85)',  border: 'oklch(0.82 0.1 85)' },
  low:    { bg: theme.pillBg,           color: theme.mutedText,        border: theme.border },
};
```
Replace with:
```js
const priorityColors = {
  high:   { bg: 'rgba(244,117,117,0.12)', color: '#f47575', border: 'rgba(244,117,117,0.35)' },
  medium: { bg: 'rgba(138,130,245,0.12)', color: '#8a82f5', border: 'rgba(138,130,245,0.35)' },
  low:    { bg: 'rgba(255,255,255,0.05)', color: '#5a6068', border: 'rgba(255,255,255,0.1)' },
};
```

- [ ] **Step 3: Replace `drawerInputStyle`**

Find:
```js
function drawerInputStyle(theme) {
  return {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: `1px solid ${theme.border}`, background: theme.bg,
    color: theme.text, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  };
}
```
Replace with:
```js
function drawerInputStyle() {
  return {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#fff', fontSize: 13,
    fontFamily: "'Inter', -apple-system, sans-serif",
    outline: 'none',
  };
}
```

Then update every call site from `drawerInputStyle(theme)` to `drawerInputStyle()`. There are ~6 call sites inside `NewTaskModal`, `NewProjectModal`, and `TaskDrawer`.

- [ ] **Step 4: Fix font references in `TaskDrawer` and `ModalShell`**

Find all occurrences of:
- `fontFamily: "'DM Sans', sans-serif"` → replace with `fontFamily: "'Inter', -apple-system, sans-serif"`
- `fontFamily: 'DM Mono, monospace'` → replace with `fontFamily: 'inherit'`
- `fontFamily: 'Syne, sans-serif'` (in `ModalShell` title) → replace with `fontFamily: "'Inter', sans-serif"`

- [ ] **Step 5: Fix "Done" CTA button color in `TaskDrawer` footer**

Find:
```jsx
background: theme.accent,
border: 'none', color: '#fff',
```
Replace with:
```jsx
background: '#00e5d4',
border: 'none', color: '#001a17',
```

- [ ] **Step 6: Fix "Delete task" button color**

Find:
```jsx
fontSize: 12, color: 'oklch(0.55 0.16 25)',
```
Replace with:
```jsx
fontSize: 12, color: '#f47575',
```

- [ ] **Step 7: Fix date input background in `TaskDrawer`**

Find in `TaskDrawer` the due date input:
```jsx
background: theme.bg, color: theme.text, fontSize: 13,
fontFamily: "'DM Mono', monospace",
```
Replace with:
```jsx
background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 13,
fontFamily: 'inherit',
```

- [ ] **Step 8: Verify — click a task on the Board to open the drawer**

Expected: Drawer slides in from right with dark `#0d0f15` surface, Noir status/priority pill buttons (cyan for in-progress, green for done, muted for todo; red/purple/muted for priority), dark inputs with subtle border, cyan "Done" CTA button, red "Delete task" text.

---

## Task 8: Final Polish Pass

**Files:**
- Modify: `BusinessBuild Ops.html` — fix topbar and NavTabs font reference

- [ ] **Step 1: Fix topbar font reference in `App`**

Find in the top bar `<div>`:
```jsx
fontFamily: "'DM Sans', sans-serif"
```
This may appear in the main content wrapper. Replace with:
```jsx
fontFamily: "'Inter', -apple-system, sans-serif"
```

- [ ] **Step 2: Verify full app end-to-end**

Open `BusinessBuild Ops.html` and check:
1. Dashboard — all 7 cards render, ring gauge animates, velocity sparkline visible, upcoming list clickable
2. Board — dark columns, drag a card between columns, click a card to open drawer
3. Calendar — today cell has cyan highlight, clicking a task opens drawer
4. Roadmap — bars render in correct Noir colors
5. Sidebar — workspace switch between FW/AP works, area collapse/expand works
6. No console errors
7. No references to old Syne, DM Sans, or DM Mono fonts in rendered output

- [ ] **Step 3: Commit**

```bash
cd "/Users/yanaboo/Downloads/design_handoff_businessbuild_ops"
git init
git add "BusinessBuild Ops.html" app-sidebar.jsx app-views.jsx app-drawer.jsx
git commit -m "redesign: replace all themes with Neo's Noir design system"
```

Note: If the directory is not already a git repo, `git init` creates one. If it is, skip `git init`.
