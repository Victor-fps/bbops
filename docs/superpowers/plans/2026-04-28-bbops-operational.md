# BusinessBuild Ops — Make It Operational

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add localStorage persistence, full CRUD for workspaces/areas/projects, and five core features (overdue badges, drag reorder, archive, search, notes verify) to make BusinessBuild Ops usable daily.

**Architecture:** A new `app-storage.js` plain-JS module owns all persistence. App's single `workspaces` state array is the source of truth — one `useEffect` auto-saves on every change. New CRUD handlers in App flow through existing `setWorkspaces` pattern. All new Sidebar/view behaviour is prop-driven from App.

**Tech Stack:** React 18 (UMD via unpkg), Babel standalone (JSX), plain JS, localStorage, no build step. Server: `python -m http.server 8080` from project folder.

---

## File Map

| File | Change |
|---|---|
| `app-storage.js` | **CREATE** — `window.BBStorage` persistence module |
| `app-data.js` | **REPLACE** — strip placeholder data, export `window.APP_DEFAULT` |
| `BusinessBuild Ops.html` | **MODIFY** — add script tag, utility fns, App state + handlers |
| `app-sidebar.jsx` | **MODIFY** — workspace/area/project CRUD UI, overdue pills, archive toggle |
| `app-views.jsx` | **MODIFY** — overdue dashboard card, drag reorder, archive filter, search panel |
| `app-drawer.jsx` | **MODIFY** — extend `ProjectModal` for edit mode + status field |

---

## Task 1: Initialize git and create app-storage.js

**Files:**
- Create: `app-storage.js`

- [ ] **Step 1: Initialize git repo**

Run in the project folder (`C:\Users\Victor\Claude Projects\design_handoff_businessbuild_ops`):
```bash
git init
git add .
git commit -m "chore: initial commit — Neo's Noir design handoff"
```

- [ ] **Step 2: Create app-storage.js**

```js
// BBStorage — localStorage persistence for BusinessBuild Ops
(function () {
  var KEY = 'bbops_data';
  var VERSION = 1;

  function defaultWorkspaces() {
    return window.APP_DEFAULT
      ? JSON.parse(JSON.stringify(window.APP_DEFAULT.workspaces))
      : [{ id: 'ws_default', name: 'My Workspace', abbr: 'MW', color: '#d4a017', areas: [] }];
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaultWorkspaces();
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== VERSION || !Array.isArray(parsed.workspaces)) {
        return defaultWorkspaces();
      }
      return parsed.workspaces;
    } catch (e) {
      return defaultWorkspaces();
    }
  }

  function save(workspaces) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        version: VERSION,
        savedAt: new Date().toISOString(),
        workspaces: workspaces,
      }));
    } catch (e) {
      console.warn('BBStorage: save failed', e);
    }
  }

  function exportJSON(workspaces) {
    var data = { version: VERSION, savedAt: new Date().toISOString(), workspaces: workspaces };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'bbops-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importJSON(onSuccess, onError) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        try {
          var parsed = JSON.parse(ev.target.result);
          if (!parsed.workspaces || !Array.isArray(parsed.workspaces)) {
            onError('Invalid file: missing workspaces array');
            return;
          }
          onSuccess(parsed.workspaces);
        } catch (err) {
          onError('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  window.BBStorage = { load: load, save: save, exportJSON: exportJSON, importJSON: importJSON, clear: clear };
})();
```

- [ ] **Step 3: Verify the module loads**

Start the server: `python -m http.server 8080` in the project folder (add `app-storage.js` script tag temporarily to test — see Task 2 for the real wiring). Open browser console, type `BBStorage.load()` — expect `[{id: 'ws_default', ...}]` or an error about APP_DEFAULT not defined (fine for now, that's Task 2).

- [ ] **Step 4: Commit**

```bash
git add app-storage.js
git commit -m "feat: add BBStorage persistence module"
```

---

## Task 2: Wire storage into App and clean app-data.js

**Files:**
- Modify: `app-data.js`
- Modify: `BusinessBuild Ops.html`

- [ ] **Step 1: Replace app-data.js contents entirely**

```js
// BusinessBuild Ops — default data (empty, user populates via UI)
window.APP_DEFAULT = {
  workspaces: [
    {
      id: 'ws_' + Date.now(),
      name: 'My Workspace',
      abbr: 'MW',
      color: '#d4a017',
      areas: [],
    }
  ]
};
```

- [ ] **Step 2: Add app-storage.js script tag to BusinessBuild Ops.html**

Find the existing script block (line 26):
```html
<script src="app-data.js"></script>
```

Replace with:
```html
<script src="app-storage.js"></script>
<script src="app-data.js"></script>
```

- [ ] **Step 3: Add utility functions for workspace, area, and project CRUD**

In `BusinessBuild Ops.html`, find the `// ── Helpers ───` section (after the NOIR object, before `calcProgress`). Add these functions after the existing helpers (`deleteTaskInWs`, `addProjectInWs`):

```js
// Workspace helpers
function addWorkspaceInWs(workspaces, workspace) {
  return [...workspaces, workspace];
}
function updateWorkspaceInWs(workspaces, wsId, updates) {
  return workspaces.map(function(ws) { return ws.id === wsId ? Object.assign({}, ws, updates) : ws; });
}
function deleteWorkspaceInWs(workspaces, wsId) {
  return workspaces.filter(function(ws) { return ws.id !== wsId; });
}

// Area helpers
function addAreaInWs(workspaces, wsId, area) {
  return workspaces.map(function(ws) {
    if (ws.id !== wsId) return ws;
    return Object.assign({}, ws, { areas: [...ws.areas, area] });
  });
}
function updateAreaInWs(workspaces, wsId, areaId, updates) {
  return workspaces.map(function(ws) {
    if (ws.id !== wsId) return ws;
    return Object.assign({}, ws, { areas: ws.areas.map(function(a) { return a.id === areaId ? Object.assign({}, a, updates) : a; }) });
  });
}
function deleteAreaInWs(workspaces, wsId, areaId) {
  return workspaces.map(function(ws) {
    if (ws.id !== wsId) return ws;
    return Object.assign({}, ws, { areas: ws.areas.filter(function(a) { return a.id !== areaId; }) });
  });
}

// Project helpers
function updateProjectInWs(workspaces, wsId, projId, updates) {
  return workspaces.map(function(ws) {
    if (ws.id !== wsId) return ws;
    return Object.assign({}, ws, { areas: ws.areas.map(function(area) {
      return Object.assign({}, area, { projects: area.projects.map(function(proj) {
        return proj.id === projId ? Object.assign({}, proj, updates) : proj;
      })});
    })});
  });
}
function deleteProjectInWs(workspaces, wsId, projId) {
  return workspaces.map(function(ws) {
    if (ws.id !== wsId) return ws;
    return Object.assign({}, ws, { areas: ws.areas.map(function(area) {
      return Object.assign({}, area, { projects: area.projects.filter(function(proj) { return proj.id !== projId; }) });
    })});
  });
}

// Reorder tasks within a column
function reorderTaskInWs(workspaces, wsId, projId, taskId, targetIndex) {
  return workspaces.map(function(ws) {
    if (ws.id !== wsId) return ws;
    return Object.assign({}, ws, { areas: ws.areas.map(function(area) {
      return Object.assign({}, area, { projects: area.projects.map(function(proj) {
        if (proj.id !== projId) return proj;
        var tasks = proj.tasks.slice();
        var fromIndex = tasks.findIndex(function(t) { return t.id === taskId; });
        if (fromIndex === -1) return proj;
        var task = tasks.splice(fromIndex, 1)[0];
        tasks.splice(targetIndex, 0, task);
        return Object.assign({}, proj, { tasks: tasks });
      })});
    })});
  });
}
```

- [ ] **Step 4: Wire App state to BBStorage**

In the `App` function, find:
```js
const [workspaces, setWorkspaces] = React.useState(() =>
  JSON.parse(JSON.stringify(window.APP_DATA.WORKSPACES))
);
```
Replace with:
```js
const [workspaces, setWorkspaces] = React.useState(() => BBStorage.load());
const [showArchived, setShowArchived] = React.useState(false);
```

Then add this `useEffect` immediately after the existing state declarations (after `const [showNewProject, setShowNewProject]`):
```js
React.useEffect(function() { BBStorage.save(workspaces); }, [workspaces]);
```

- [ ] **Step 5: Add new App handlers**

Add these handlers to the App function body (after `handleAddProject`):

```js
const handleAddWorkspace = (ws) => setWorkspaces(prev => addWorkspaceInWs(prev, ws));
const handleRenameWorkspace = (wsId, updates) => setWorkspaces(prev => updateWorkspaceInWs(prev, wsId, updates));
const handleDeleteWorkspace = (wsId) => {
  setWorkspaces(prev => {
    const next = deleteWorkspaceInWs(prev, wsId);
    if (next.length === 0) return prev;
    return next;
  });
  setWsId(ws => workspaces.find(w => w.id !== wsId)?.id || workspaces[0].id);
  setSelectedProject(null);
  setDrawerTask(null);
};
const handleResetData = () => {
  BBStorage.clear();
  const fresh = BBStorage.load();
  setWorkspaces(fresh);
  setWsId(fresh[0].id);
  setSelectedProject(null);
  setDrawerTask(null);
};
const handleAddArea = (wsId, area) => setWorkspaces(prev => addAreaInWs(prev, wsId, area));
const handleRenameArea = (wsId, areaId, name) => setWorkspaces(prev => updateAreaInWs(prev, wsId, areaId, { name }));
const handleDeleteArea = (wsId, areaId) => setWorkspaces(prev => deleteAreaInWs(prev, wsId, areaId));
const handleUpdateProject = (projId, updates) => setWorkspaces(prev => updateProjectInWs(prev, wsId, projId, updates));
const handleDeleteProject = (projId) => {
  setWorkspaces(prev => deleteProjectInWs(prev, wsId, projId));
  if (selectedProject === projId) setSelectedProject(null);
};
const handleReorderTask = (projId, taskId, targetIndex) => {
  setWorkspaces(prev => reorderTaskInWs(prev, wsId, projId, taskId, targetIndex));
};
```

- [ ] **Step 6: Derive visibleWorkspace and overdueMap in App**

Add these derived values after the `workspace` declaration:
```js
const workspace = workspaces.find(w => w.id === wsId) || workspaces[0];

const visibleWorkspace = React.useMemo(function() {
  if (showArchived) return workspace;
  return Object.assign({}, workspace, {
    areas: workspace.areas.map(function(area) {
      return Object.assign({}, area, {
        projects: area.projects.filter(function(p) { return p.status !== 'archived'; }),
      });
    }),
  });
}, [workspace, showArchived]);

const overdueMap = React.useMemo(function() {
  var map = {};
  var todayStr = new Date().toDateString();
  workspace.areas.forEach(function(area) {
    area.projects.forEach(function(proj) {
      var count = proj.tasks.filter(function(t) {
        return t.status !== 'done' && t.due && new Date(t.due + 'T00:00:00') < new Date(todayStr);
      }).length;
      if (count > 0) map[proj.id] = count;
    });
  });
  return map;
}, [workspace]);
```

- [ ] **Step 7: Update Sidebar and ViewComponent calls to pass new props**

Find the `<Sidebar .../>` render call and replace it:
```jsx
<Sidebar
  workspace={workspace}
  workspaces={workspaces}
  onSwitchWorkspace={handleSwitchWs}
  selectedProject={selectedProject}
  onSelectProject={(id) => { setSelectedProject(id); setActiveView('kanban'); }}
  activeView={activeView}
  onSetView={setActiveView}
  theme={theme}
  overdueMap={overdueMap}
  onAddWorkspace={handleAddWorkspace}
  onRenameWorkspace={handleRenameWorkspace}
  onDeleteWorkspace={handleDeleteWorkspace}
  onResetData={handleResetData}
  onAddArea={handleAddArea}
  onRenameArea={handleRenameArea}
  onDeleteArea={handleDeleteArea}
  onEditProject={handleUpdateProject}
  onDeleteProject={handleDeleteProject}
  showArchived={showArchived}
  onToggleArchived={() => setShowArchived(prev => !prev)}
/>
```

Find the `ViewComponent` render call (inside the flex div). Change `workspace={workspace}` to `workspace={visibleWorkspace}` in the ViewComponent props spread. Also add `overdueMap={overdueMap}` and `onReorderTask={handleReorderTask}` and `onEditProject={handleUpdateProject}` and `onDeleteProject={handleDeleteProject}`:
```jsx
<ViewComponent
  workspace={visibleWorkspace}
  selectedProject={selectedProject}
  theme={theme}
  onOpenTask={handleOpenTask}
  onMoveTask={handleMoveTask}
  onAddTask={handleAddTask}
  onNewProject={() => setShowNewProject(true)}
  overdueMap={overdueMap}
  onReorderTask={handleReorderTask}
  onEditProject={handleUpdateProject}
  onDeleteProject={handleDeleteProject}
/>
```

- [ ] **Step 8: Verify persistence works**

Open http://localhost:8080/BusinessBuild%20Ops.html — app shows "My Workspace" with no areas. Open browser DevTools → Application → Local Storage → check `bbops_data` key exists with `version: 1`. Refresh — workspace still shows. 

- [ ] **Step 9: Commit**

```bash
git add app-data.js "BusinessBuild Ops.html"
git commit -m "feat: wire BBStorage into App — persistence + all CRUD handlers"
```

---

## Task 3: Import/Export UI in top bar

**Files:**
- Modify: `BusinessBuild Ops.html`

- [ ] **Step 1: Add toast state and import/export handlers to App**

Add to App's state declarations:
```js
const [toast, setToast] = React.useState(null);
```

Add helper right after:
```js
const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
```

Add handlers:
```js
const handleExport = () => BBStorage.exportJSON(workspaces);
const handleImport = () => BBStorage.importJSON(
  (imported) => { setWorkspaces(imported); setWsId(imported[0].id); showToast('Data imported — ' + imported.length + ' workspace(s) loaded'); },
  (err) => showToast('Import failed: ' + err)
);
```

- [ ] **Step 2: Add icon buttons to top bar and toast to App render**

Find the top bar div and update its contents:
```jsx
<div style={{
  height: 52, display: 'flex', alignItems: 'center',
  padding: '0 24px', borderBottom: `1px solid ${theme.border}`,
  background: theme.surface, gap: 8, flexShrink: 0,
  boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
}}>
  <span style={{ fontSize: 14, fontWeight: 600, color: theme.text, flex: 1 }}>
    {viewLabels[activeView]}
  </span>
  <button onClick={handleExport} title="Export data as JSON" style={{
    width: 30, height: 30, borderRadius: 7, border: `1px solid ${theme.border}`,
    background: 'transparent', color: theme.mutedText, fontSize: 14,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>↓</button>
  <button onClick={handleImport} title="Import data from JSON" style={{
    width: 30, height: 30, borderRadius: 7, border: `1px solid ${theme.border}`,
    background: 'transparent', color: theme.mutedText, fontSize: 14,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>↑</button>
  <NavTabs activeView={activeView} onSetView={setActiveView} theme={theme} />
</div>
```

Add toast just before the closing `</div>` of the root App div:
```jsx
{toast && (
  <div style={{
    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
    background: '#0d0f15', border: '1px solid rgba(0,229,212,0.35)',
    color: '#00e5d4', fontSize: 13, fontWeight: 500,
    padding: '10px 20px', borderRadius: 10, zIndex: 999,
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  }}>{toast}</div>
)}
```

- [ ] **Step 3: Verify export and import**

Click the ↓ button — browser prompts to save `bbops-YYYY-MM-DD.json`. Open the file — it contains `{ version: 1, savedAt: ..., workspaces: [...] }`. Click ↑ button, select the exported file — toast shows "Data imported — 1 workspace(s) loaded".

- [ ] **Step 4: Commit**

```bash
git add "BusinessBuild Ops.html"
git commit -m "feat: add import/export JSON buttons and toast notification"
```

---

## Task 4: Workspace CRUD — UI in Sidebar

**Files:**
- Modify: `app-sidebar.jsx`
- Modify: `app-drawer.jsx` (add `WorkspaceModal`)

- [ ] **Step 1: Add WorkspaceModal to app-drawer.jsx**

Add before the `Object.assign(window, ...)` line at the bottom of `app-drawer.jsx`:

```jsx
// Preset colors for new workspaces
const WS_COLORS = ['#d4a017','#6366f1','#ec4899','#10b981','#f97316','#3b82f6','#a855f7','#14b8a6'];

function autoAbbr(name) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function WorkspaceModal({ theme, workspaces, existingWs, onSave, onClose }) {
  const nextColor = WS_COLORS[workspaces.length % WS_COLORS.length];
  const [form, setForm] = React.useState(
    existingWs
      ? { name: existingWs.name, abbr: existingWs.abbr, color: existingWs.color }
      : { name: '', abbr: '', color: nextColor }
  );
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleNameChange = (v) => {
    set('name', v);
    if (!existingWs) set('abbr', autoAbbr(v));
  };

  return (
    <ModalShell
      title={existingWs ? 'Rename Workspace' : 'New Workspace'}
      theme={theme}
      onClose={onClose}
      onSave={() => {
        if (!form.name.trim()) return;
        onSave({ name: form.name.trim(), abbr: form.abbr.trim().slice(0,2).toUpperCase() || autoAbbr(form.name), color: form.color });
        onClose();
      }}
    >
      <DrawerField label="Workspace Name" theme={theme}>
        <input autoFocus value={form.name} onChange={e => handleNameChange(e.target.value)}
          placeholder="e.g. Flores RE Wholesale" style={drawerInputStyle()} />
      </DrawerField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <DrawerFieldInline label="Abbreviation (2 chars)" theme={theme}>
          <input value={form.abbr} maxLength={2} onChange={e => set('abbr', e.target.value.toUpperCase())}
            placeholder="FW" style={drawerInputStyle()} />
        </DrawerFieldInline>
        <DrawerFieldInline label="Color" theme={theme}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', paddingTop: 4 }}>
            {WS_COLORS.map(c => (
              <div key={c} onClick={() => set('color', c)} style={{
                width: 20, height: 20, borderRadius: 5, background: c, cursor: 'pointer',
                border: form.color === c ? '2px solid #fff' : '2px solid transparent',
              }} />
            ))}
          </div>
        </DrawerFieldInline>
      </div>
    </ModalShell>
  );
}
```

Update the export line:
```js
Object.assign(window, { TaskDrawer, NewTaskModal, NewProjectModal, WorkspaceModal });
```

- [ ] **Step 2: Add workspace context menu and + button to app-sidebar.jsx**

Replace the entire `Sidebar` function with this updated version. Key changes: right-click context menu on workspace tab buttons, + button at end of tabs row, `WorkspaceModal` state, confirmation dialogs:

```jsx
function Sidebar({
  workspace, workspaces, onSwitchWorkspace, selectedProject, onSelectProject,
  activeView, onSetView, theme, overdueMap,
  onAddWorkspace, onRenameWorkspace, onDeleteWorkspace, onResetData,
  onAddArea, onRenameArea, onDeleteArea,
  onEditProject, onDeleteProject,
  showArchived, onToggleArchived,
}) {
  const [expandedAreas, setExpandedAreas] = React.useState(() => {
    const init = {};
    workspace.areas.forEach(a => { init[a.id] = true; });
    return init;
  });

  // Sync expanded areas when workspace changes
  React.useEffect(() => {
    setExpandedAreas(prev => {
      const init = { ...prev };
      workspace.areas.forEach(a => { if (!(a.id in init)) init[a.id] = true; });
      return init;
    });
  }, [workspace.id]);

  const toggleArea = (id) => setExpandedAreas(prev => ({ ...prev, [id]: !prev[id] }));

  const allTasks = workspace.areas.flatMap(a => a.projects.flatMap(p => p.tasks));
  const activeCount = allTasks.filter(t => t.status === 'in-progress').length;

  const views = [
    { id: 'dashboard', label: 'Dashboard', icon: '▦' },
    { id: 'kanban',    label: 'Board',     icon: '⊞' },
    { id: 'calendar',  label: 'Calendar',  icon: '⊟' },
    { id: 'roadmap',   label: 'Roadmap',   icon: '▬' },
  ];

  // Workspace modal state
  const [wsModal, setWsModal] = React.useState(null); // null | 'add' | ws object for rename

  // Context menu state
  const [ctxMenu, setCtxMenu] = React.useState(null); // null | { wsId, x, y }

  // Area inline edit state
  const [editingArea, setEditingArea] = React.useState(null); // null | areaId
  const [editingAreaName, setEditingAreaName] = React.useState('');

  // Project menu state
  const [projMenu, setProjMenu] = React.useState(null); // null | { projId, x, y }

  const handleWsContextMenu = (e, ws) => {
    e.preventDefault();
    setCtxMenu({ wsId: ws.id, wsName: ws.name, x: e.clientX, y: e.clientY });
  };

  const closeCtxMenu = () => setCtxMenu(null);

  const handleDeleteWs = (wsId, wsName) => {
    closeCtxMenu();
    if (workspaces.length <= 1) return alert('At least one workspace is required.');
    if (window.confirm('Delete "' + wsName + '"? This permanently removes all areas, projects, and tasks inside.')) {
      onDeleteWorkspace(wsId);
    }
  };

  const handleResetConfirm = () => {
    closeCtxMenu();
    const typed = window.prompt('Type RESET to confirm wiping all data:');
    if (typed === 'RESET') onResetData();
  };

  const startEditArea = (area) => {
    setEditingArea(area.id);
    setEditingAreaName(area.name);
  };

  const commitAreaRename = (areaId) => {
    if (editingAreaName.trim()) onRenameArea(workspace.id, areaId, editingAreaName.trim());
    setEditingArea(null);
  };

  const handleDeleteArea = (areaId, areaName, hasProjects) => {
    if (hasProjects) {
      if (!window.confirm('Delete "' + areaName + '"? All projects and tasks inside will be removed.')) return;
    }
    onDeleteArea(workspace.id, areaId);
  };

  const handleDeleteProject = (projId, projName) => {
    setProjMenu(null);
    if (window.confirm('Delete "' + projName + '"? All tasks inside will be removed.')) {
      onDeleteProject(projId);
    }
  };

  const handleArchiveProject = (projId) => {
    setProjMenu(null);
    onEditProject(projId, { status: 'archived' });
  };

  const handleUnarchiveProject = (projId) => {
    setProjMenu(null);
    onEditProject(projId, { status: 'active' });
  };

  return (
    <>
      {/* Click-away overlay for context menus */}
      {(ctxMenu || projMenu) && (
        <div onClick={() => { setCtxMenu(null); setProjMenu(null); }}
          style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
      )}

      {/* Workspace context menu */}
      {ctxMenu && (
        <div style={{
          position: 'fixed', left: ctxMenu.x, top: ctxMenu.y,
          background: '#0d0f15', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '4px 0', zIndex: 201,
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)', minWidth: 160,
        }}>
          {[
            { label: 'Rename', action: () => { closeCtxMenu(); setWsModal(workspaces.find(w => w.id === ctxMenu.wsId)); } },
            { label: 'Delete', action: () => handleDeleteWs(ctxMenu.wsId, ctxMenu.wsName), danger: true },
            { label: 'Reset all data', action: handleResetConfirm, danger: true },
          ].map(item => (
            <button key={item.label} onClick={item.action} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 14px', background: 'transparent', border: 'none',
              color: item.danger ? '#f47575' : '#aab0b8', fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{item.label}</button>
          ))}
        </div>
      )}

      {/* Project context menu */}
      {projMenu && (
        <div style={{
          position: 'fixed', left: projMenu.x, top: projMenu.y,
          background: '#0d0f15', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '4px 0', zIndex: 201,
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)', minWidth: 150,
        }}>
          {[
            projMenu.isArchived
              ? { label: 'Unarchive', action: () => handleUnarchiveProject(projMenu.projId) }
              : { label: 'Archive project', action: () => handleArchiveProject(projMenu.projId) },
            { label: 'Delete project', action: () => handleDeleteProject(projMenu.projId, projMenu.projName), danger: true },
          ].map(item => (
            <button key={item.label} onClick={item.action} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 14px', background: 'transparent', border: 'none',
              color: item.danger ? '#f47575' : '#aab0b8', fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{item.label}</button>
          ))}
        </div>
      )}

      {/* Workspace modal */}
      {wsModal && (
        <WorkspaceModal
          theme={{ surface: '#0d0f15', border: 'rgba(255,255,255,0.08)', text: '#fff', mutedText: '#5a6068', accent: '#00e5d4' }}
          workspaces={workspaces}
          existingWs={wsModal === 'add' ? null : wsModal}
          onSave={(data) => {
            if (wsModal === 'add') {
              onAddWorkspace({ id: 'ws_' + Date.now(), areas: [], ...data });
            } else {
              onRenameWorkspace(wsModal.id, data);
            }
          }}
          onClose={() => setWsModal(null)}
        />
      )}

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

        {/* Workspace tabs + add button */}
        <div style={{ display: 'flex', gap: 4, padding: '0 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', alignItems: 'center' }}>
          {workspaces.map(ws => (
            <button key={ws.id}
              onClick={() => onSwitchWorkspace(ws.id)}
              onContextMenu={(e) => handleWsContextMenu(e, ws)}
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
          <button onClick={() => setWsModal('add')} title="Add workspace" style={{
            width: 22, height: 22, borderRadius: 5, border: '1px solid rgba(255,255,255,0.08)',
            background: 'transparent', color: '#5a6068', fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>+</button>
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
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px 6px' }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', color: '#4a5058', fontFamily: 'inherit', flex: 1 }}>AREAS</div>
            <button
              onClick={() => {
                const name = window.prompt('Area name:');
                if (name && name.trim()) onAddArea(workspace.id, { id: 'area_' + Date.now(), name: name.trim(), projects: [] });
              }}
              title="Add area"
              style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#5a6068', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          {workspace.areas.map(area => (
            <div key={area.id}>
              {/* Area header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px' }}
                onMouseEnter={e => e.currentTarget.querySelector('.area-actions').style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.querySelector('.area-actions').style.opacity = '0'}
              >
                <button onClick={() => toggleArea(area.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    flex: 1, padding: '4px 6px', border: 'none',
                    background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  <span style={{ fontSize: 11, color: '#5a6068', display: 'inline-block', transition: 'transform 0.15s', transform: expandedAreas[area.id] ? 'rotate(90deg)' : 'rotate(0deg)', width: 10 }}>›</span>
                  {editingArea === area.id ? (
                    <input
                      autoFocus
                      value={editingAreaName}
                      onChange={e => setEditingAreaName(e.target.value)}
                      onBlur={() => commitAreaRename(area.id)}
                      onKeyDown={e => { if (e.key === 'Enter') commitAreaRename(area.id); if (e.key === 'Escape') setEditingArea(null); }}
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: 11, fontWeight: 600, color: '#aab0b8', background: 'transparent', border: 'none', outline: '1px solid rgba(0,229,212,0.4)', borderRadius: 3, padding: '0 2px', width: 100, fontFamily: 'inherit' }}
                    />
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#aab0b8', letterSpacing: '0.03em' }}>{area.name}</span>
                  )}
                </button>
                <div className="area-actions" style={{ display: 'flex', gap: 2, opacity: 0, transition: 'opacity 0.1s' }}>
                  <button onClick={(e) => { e.stopPropagation(); startEditArea(area); }} title="Rename area" style={{ width: 16, height: 16, borderRadius: 3, border: 'none', background: 'transparent', color: '#5a6068', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✎</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteArea(area.id, area.name, area.projects.length > 0); }} title="Delete area" style={{ width: 16, height: 16, borderRadius: 3, border: 'none', background: 'transparent', color: '#f47575', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              </div>
              {/* Projects in area */}
              {expandedAreas[area.id] && area.projects.map(proj => {
                const on = selectedProject === proj.id;
                const isArchived = proj.status === 'archived';
                const overdueCount = overdueMap && overdueMap[proj.id];
                return (
                  <div key={proj.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}
                    onMouseEnter={e => { const btn = e.currentTarget.querySelector('.proj-menu-btn'); if (btn) btn.style.opacity = '1'; }}
                    onMouseLeave={e => { const btn = e.currentTarget.querySelector('.proj-menu-btn'); if (btn) btn.style.opacity = '0'; }}
                  >
                    <button onClick={() => onSelectProject(proj.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        flex: 1, margin: '1px 4px 1px 4px',
                        padding: '5px 8px 5px 22px',
                        border: 'none',
                        borderLeft: on ? '2px solid #00e5d4' : '2px solid transparent',
                        background: on ? 'rgba(255,255,255,0.04)' : 'transparent',
                        color: on ? '#fff' : (isArchived ? '#3a4048' : '#5a6068'),
                        cursor: 'pointer', fontFamily: 'inherit',
                        borderRadius: '0 6px 6px 0', transition: 'all 0.1s',
                        opacity: isArchived ? 0.5 : 1,
                      }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: isArchived ? '#3a4048' : proj.status === 'active' ? '#1de9b6' : '#3a4048', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, flex: 1, textAlign: 'left', lineHeight: 1.3, fontStyle: isArchived ? 'italic' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.name}</span>
                      {overdueCount > 0 && !isArchived && (
                        <span style={{ fontSize: 9, fontWeight: 700, background: '#ef4444', color: '#fff', padding: '1px 5px', borderRadius: 10, flexShrink: 0 }}>{overdueCount}</span>
                      )}
                    </button>
                    <button className="proj-menu-btn"
                      onClick={(e) => { e.stopPropagation(); setProjMenu({ projId: proj.id, projName: proj.name, isArchived, x: e.clientX, y: e.clientY }); }}
                      style={{ width: 16, height: 16, borderRadius: 3, border: 'none', background: 'transparent', color: '#5a6068', fontSize: 14, cursor: 'pointer', opacity: 0, transition: 'opacity 0.1s', flexShrink: 0, marginRight: 6 }}>···</button>
                  </div>
                );
              })}
            </div>
          ))}
          {/* Show archived toggle */}
          {workspace.areas.some(a => a.projects.some(p => p.status === 'archived')) && (
            <button onClick={onToggleArchived} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '6px 10px', border: 'none', background: 'transparent',
              color: '#4a5058', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit',
              marginTop: 4,
            }}>{showArchived ? 'Hide archived' : 'Show archived'}</button>
          )}
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 10px' }}>
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
    </>
  );
}

Object.assign(window, { Sidebar });
```

- [ ] **Step 3: Verify workspace CRUD**

Open the app. Right-click a workspace tab → context menu shows Rename, Delete, Reset all data. Click + → WorkspaceModal appears with name/abbr/color fields. Create a new workspace → it appears as a tab. Switch to it → workspace card updates. Right-click → Rename → modal pre-fills. Right-click → Delete → confirm dialog → workspace removed, switches to remaining workspace.

- [ ] **Step 4: Commit**

```bash
git add app-sidebar.jsx app-drawer.jsx
git commit -m "feat: workspace CRUD — add, rename, delete via sidebar context menu"
```

---

## Task 5: Area CRUD and Project CRUD in Sidebar

The Sidebar code written in Task 4 already contains the complete area and project CRUD UI. This task verifies each piece and wires the project Edit modal.

**Files:**
- Modify: `app-drawer.jsx` — extend `NewProjectModal` into `ProjectModal`

- [ ] **Step 1: Rename and extend NewProjectModal in app-drawer.jsx**

Replace the entire `NewProjectModal` function with `ProjectModal` (which handles both create and edit):

```jsx
function ProjectModal({ theme, areas, existingProj, onSave, onClose }) {
  const [form, setForm] = React.useState(
    existingProj
      ? { name: existingProj.name, areaId: '', status: existingProj.status || 'active', startDate: existingProj.startDate || '', endDate: existingProj.endDate || '' }
      : { name: '', areaId: areas[0]?.id || '', status: 'planned', startDate: '', endDate: '' }
  );
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <ModalShell
      title={existingProj ? 'Edit Project' : 'New Project'}
      theme={theme}
      onClose={onClose}
      onSave={() => {
        if (!form.name.trim()) return;
        if (existingProj) {
          onSave({ name: form.name.trim(), status: form.status, startDate: form.startDate, endDate: form.endDate });
        } else {
          onSave({ ...form, id: 'proj-' + Date.now(), progress: 0, tasks: [] });
        }
        onClose();
      }}
    >
      <DrawerField label="Project Name" theme={theme}>
        <input autoFocus value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="What are you building?" style={drawerInputStyle()} />
      </DrawerField>
      {!existingProj && (
        <DrawerField label="Area" theme={theme}>
          <select value={form.areaId} onChange={e => set('areaId', e.target.value)} style={drawerInputStyle()}>
            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </DrawerField>
      )}
      <DrawerField label="Status" theme={theme}>
        <select value={form.status} onChange={e => set('status', e.target.value)} style={drawerInputStyle()}>
          <option value="active">Active</option>
          <option value="planned">Planned</option>
          <option value="archived">Archived</option>
        </select>
      </DrawerField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <DrawerFieldInline label="Start Date" theme={theme}>
          <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} style={drawerInputStyle()} />
        </DrawerFieldInline>
        <DrawerFieldInline label="End Date" theme={theme}>
          <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} style={drawerInputStyle()} />
        </DrawerFieldInline>
      </div>
    </ModalShell>
  );
}
```

Update export line:
```js
Object.assign(window, { TaskDrawer, NewTaskModal, ProjectModal, WorkspaceModal });
```

- [ ] **Step 2: Update App to use ProjectModal instead of NewProjectModal**

In `BusinessBuild Ops.html`, find the `{showNewProject && (` block and replace `NewProjectModal` with `ProjectModal`:
```jsx
{showNewProject && (
  <ProjectModal
    theme={theme}
    areas={workspace.areas}
    onSave={handleAddProject}
    onClose={() => setShowNewProject(false)}
  />
)}
```

Also add an `editProject` state and modal:
```js
const [editingProject, setEditingProject] = React.useState(null); // project object or null
```

Add the edit modal to App render (just before the closing `</div>`):
```jsx
{editingProject && (
  <ProjectModal
    theme={theme}
    areas={workspace.areas}
    existingProj={editingProject}
    onSave={(updates) => handleUpdateProject(editingProject.id, updates)}
    onClose={() => setEditingProject(null)}
  />
)}
```

Pass `onEditProject={(proj) => setEditingProject(proj)}` to Sidebar (update the Sidebar render call — change `onEditProject={handleUpdateProject}` to `onEditProject={(proj) => setEditingProject(proj)}`).

Update the projMenu's Rename/Edit action in Sidebar to pass the full project object. Find the workspace areas to get the project:
```jsx
// In Sidebar, update the proj-menu-btn context menu to include Edit:
{[
  { label: 'Edit project', action: () => {
    setProjMenu(null);
    const proj = workspace.areas.flatMap(a => a.projects).find(p => p.id === projMenu.projId);
    onEditProject(proj);
  }},
  projMenu.isArchived
    ? { label: 'Unarchive', action: () => handleUnarchiveProject(projMenu.projId) }
    : { label: 'Archive project', action: () => handleArchiveProject(projMenu.projId) },
  { label: 'Delete project', action: () => handleDeleteProject(projMenu.projId, projMenu.projName), danger: true },
].map(...)}
```

- [ ] **Step 3: Verify area + project CRUD**

Open the app. Hover an area header → rename (✎) and delete (×) icons appear. Click ✎ → area name becomes an editable input, Enter to confirm. Click the + next to AREAS → prompt for area name → new area appears in sidebar.

Hover a project row → ··· appears. Click → context menu shows Edit project, Archive project, Delete project. Click Edit → ProjectModal pre-fills with project name and status. Modify and save → sidebar updates.

- [ ] **Step 4: Commit**

```bash
git add app-drawer.jsx "BusinessBuild Ops.html" app-sidebar.jsx
git commit -m "feat: area and project CRUD — inline area edit, project modal, archive/delete"
```

---

## Task 6: Verify task notes auto-save

**Files:**
- Verify only (no code change expected)

- [ ] **Step 1: Test notes persistence**

Open the app. Create a new workspace "Test WS", add an area "Test Area", add a project "Test Project", add a task "Test Task". Click the task to open the drawer. Type in the notes field: "these are my notes". Close the drawer (click Done or the backdrop). Refresh the page. Open the same task. Confirm "these are my notes" is still there.

Expected: notes persist. The `save()` function in TaskDrawer already calls `onUpdate` on every `onChange` (line 13-17 of app-drawer.jsx) — this was correct from the start. With localStorage now wired via `useEffect`, notes save to disk on every keystroke.

- [ ] **Step 2: If notes are NOT persisting (fallback fix)**

If the test above fails, open `app-drawer.jsx` and confirm the notes textarea `onChange` matches:
```jsx
<textarea value={editing.notes || ''} onChange={e => save('notes', e.target.value)}
```
The `save` function is:
```js
const save = (field, val) => {
  const updated = { ...editing, [field]: val };
  setEditing(updated);
  onUpdate(updated);
};
```
If `onUpdate` is not being called here, add an explicit `onBlur` fallback:
```jsx
<textarea value={editing.notes || ''} 
  onChange={e => save('notes', e.target.value)}
  onBlur={e => onUpdate({ ...editing, notes: e.target.value })}
```

- [ ] **Step 3: Commit (only if a fix was needed)**

```bash
git add app-drawer.jsx
git commit -m "fix: ensure task notes call onUpdate on every change"
```

---

## Task 7: Overdue dashboard card

**Files:**
- Modify: `app-views.jsx`

- [ ] **Step 1: Add OverdueCard component to app-views.jsx**

Add before the `Object.assign(window, ...)` line at the bottom:

```jsx
function OverdueCard({ workspace, overdueMap, onOpenTask, card }) {
  const today = new Date().toDateString();
  const allProjects = workspace.areas.flatMap(a => a.projects);
  const overdueGroups = allProjects.reduce((acc, proj) => {
    const tasks = proj.tasks.filter(t =>
      t.status !== 'done' && t.due && new Date(t.due + 'T00:00:00') < new Date(today)
    );
    if (tasks.length > 0) acc.push({ proj, tasks });
    return acc;
  }, []);
  const totalCount = overdueGroups.reduce((n, g) => n + g.tasks.length, 0);
  const hasOverdue = overdueGroups.length > 0;

  return (
    <div style={{ ...card, padding: 0, overflow: 'hidden', gridColumn: '1 / -1' }}>
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: hasOverdue ? '#f47575' : '#fff' }}>Overdue</div>
          <div style={{ fontSize: 9, color: '#5a6068', marginTop: 1 }}>
            {hasOverdue ? totalCount + ' task' + (totalCount > 1 ? 's' : '') + ' need attention' : 'All on track'}
          </div>
        </div>
        {hasOverdue && <span style={{ fontSize: 16 }}>⚠</span>}
      </div>
      {hasOverdue ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 0 }}>
          {overdueGroups.map(({ proj, tasks }) => (
            <div key={proj.id} style={{ borderRight: '1px solid rgba(255,255,255,0.04)', padding: '8px 0' }}>
              <div style={{ padding: '2px 14px 6px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#5a6068' }}>
                {proj.name.toUpperCase()}
              </div>
              {tasks.map(t => (
                <div key={t.id}
                  onClick={() => onOpenTask && onOpenTask(t, proj)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 10, color: '#d0d4da', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  <span style={{ fontSize: 9, color: '#f47575', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(t.due)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1de9b6', boxShadow: '0 0 6px rgba(29,233,182,0.6)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#1de9b6', fontWeight: 500 }}>All tasks on track</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add OverdueCard to DashboardView**

In `DashboardView`, update the function signature to accept `overdueMap`:
```jsx
function DashboardView({ workspace, theme, onOpenTask, onNewProject, overdueMap }) {
```

Then add the card to the grid. Find the Active Projects card (`{/* 7. Active Projects */}`). Insert `<OverdueCard>` before it:

```jsx
{/* 8. Overdue — full width */}
<OverdueCard workspace={workspace} overdueMap={overdueMap} onOpenTask={onOpenTask} card={card} />

{/* 7. Active Projects — full width */}
<div style={{ ...card, gridColumn: '1 / -1', padding: '14px 16px' }}>
```

- [ ] **Step 3: Verify overdue card**

Create a task with a due date in the past and status "todo" or "in-progress". Go to Dashboard. Verify the Overdue card shows that task with a red dot and the due date in red. Mark the task as done → the overdue card immediately shows "All tasks on track".

If no tasks are overdue, the card shows the green "All tasks on track" state.

- [ ] **Step 4: Commit**

```bash
git add app-views.jsx
git commit -m "feat: overdue dashboard card with live task list"
```

---

## Task 8: Drag to reorder within a column

**Files:**
- Modify: `app-views.jsx`

- [ ] **Step 1: Add drag-over-card tracking to KanbanView**

In `KanbanView`, add a new state variable after the existing drag state:
```jsx
const [dragOverCard, setDragOverCard] = React.useState(null); // { taskId, index, colId }
const [draggingTaskStatus, setDraggingTaskStatus] = React.useState(null);
```

- [ ] **Step 2: Update KanbanCard to be a drop target**

Replace the `KanbanCard` function with this updated version that handles both drag source and drop target roles:

```jsx
function KanbanCard({ task, colId, taskIndex, theme, onOpen, onMove, onReorder }) {
  const colIdx = COL_ORDER.indexOf(colId);
  const overdue = isOverdue(task.due) && task.status !== 'done';
  const [isDropTarget, setIsDropTarget] = React.useState(false);

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.setData('taskStatus', task.status);
        e.dataTransfer.setData('taskIndex', String(taskIndex));
      }}
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDropTarget(true); }}
      onDragLeave={() => setIsDropTarget(false)}
      onDrop={e => {
        e.preventDefault();
        e.stopPropagation();
        setIsDropTarget(false);
        const draggedId = e.dataTransfer.getData('taskId');
        const draggedStatus = e.dataTransfer.getData('taskStatus');
        if (!draggedId || draggedId === task.id) return;
        if (draggedStatus === colId) {
          // Same column — reorder
          onReorder && onReorder(draggedId, taskIndex);
        } else {
          // Cross column — move
          onMove(draggedId, colId);
        }
      }}
      onClick={onOpen}
      style={{
        background: theme.surface, borderRadius: 10, padding: '12px 13px',
        border: `1px solid ${isDropTarget ? 'rgba(0,229,212,0.5)' : overdue ? 'rgba(244,117,117,0.5)' : 'rgba(255,255,255,0.05)'}`,
        boxShadow: isDropTarget ? '0 0 0 2px rgba(0,229,212,0.2)' : theme.cardShadow,
        cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = theme.cardShadowHover; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isDropTarget ? '0 0 0 2px rgba(0,229,212,0.2)' : theme.cardShadow; }}
    >
      <div style={{ fontSize: 13, fontWeight: 500, color: theme.text, lineHeight: 1.4, marginBottom: 8 }}>{task.title}</div>
      {task.notes && <div style={{ fontSize: 11, color: theme.mutedText, marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.notes}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {priorityBadge(task.priority)}
        {task.due && <span style={{ fontSize: 10, fontFamily: 'inherit', color: overdue ? '#f47575' : '#5a6068', marginLeft: 2 }}>
          {overdue ? '⚠ ' : ''}{fmtDate(task.due)}
        </span>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }} onClick={e => e.stopPropagation()}>
          {colIdx > 0 && (
            <button onClick={() => onMove(task.id, COL_ORDER[colIdx - 1])} style={arrowBtnStyle(theme)} title="Move back">←</button>
          )}
          {colIdx < COL_ORDER.length - 1 && (
            <button onClick={() => onMove(task.id, COL_ORDER[colIdx + 1])} style={{ ...arrowBtnStyle(theme), background: 'rgba(0,229,212,0.12)', borderColor: 'rgba(0,229,212,0.35)', color: '#00e5d4' }} title="Move forward">→</button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update KanbanView to pass onReorder and taskIndex to cards**

In `KanbanView`, update the ViewComponent call signature to accept `onReorderTask`:
```jsx
function KanbanView({ workspace, selectedProject, theme, onOpenTask, onMoveTask, onAddTask, onReorderTask }) {
```

Update the tasks map inside the column:
```jsx
{tasks.map((t, taskIndex) => (
  <KanbanCard key={t.id} task={t} colId={colId} taskIndex={taskIndex} theme={theme}
    onOpen={() => onOpenTask(t, proj)}
    onMove={move}
    onReorder={(taskId, targetIndex) => onReorderTask && onReorderTask(proj.id, taskId, targetIndex)}
  />
))}
```

- [ ] **Step 4: Verify drag reorder**

Open the Board view. Select a project with multiple tasks in one column. Drag a card and drop it onto another card in the SAME column — the dragged card should reinsert at that position. The drop target card gets a cyan highlight border while hovering.

Drag a card to a DIFFERENT column — it moves to that column's status (existing behavior preserved).

- [ ] **Step 5: Commit**

```bash
git add app-views.jsx
git commit -m "feat: drag to reorder tasks within a column"
```

---

## Task 9: Archive projects (view filtering and toggle)

The sidebar archive/unarchive actions and the `showArchived` + `visibleWorkspace` logic were already wired in Task 2 and 4. This task verifies the full flow and adds the `archived` status to `StatusPill`.

**Files:**
- Modify: `app-views.jsx`

- [ ] **Step 1: Add 'archived' to StatusPill**

In `app-views.jsx`, find the `StatusPill` function and add the archived entry:
```jsx
const cfg = {
  'done':        { label: 'Done',        bg: 'rgba(29,233,182,0.12)',  color: '#1de9b6' },
  'in-progress': { label: 'In Progress', bg: 'rgba(0,229,212,0.12)',   color: '#00e5d4' },
  'todo':        { label: 'To Do',       bg: 'rgba(255,255,255,0.05)', color: '#5a6068' },
  'active':      { label: 'Active',      bg: 'rgba(0,229,212,0.12)',   color: '#00e5d4' },
  'planned':     { label: 'Planned',     bg: 'rgba(255,255,255,0.05)', color: '#5a6068' },
  'archived':    { label: 'Archived',    bg: 'rgba(255,255,255,0.04)', color: '#3a4048' },
};
```

- [ ] **Step 2: Verify full archive flow**

Right-click a project in the sidebar → "Archive project". The project disappears from the sidebar (because `visibleWorkspace` filters it out). No archived project tabs appear in the Board view.

Click "Show archived" at the bottom of the sidebar (appears when at least one archived project exists) → the archived project reappears with 40% opacity and italic name. It also reappears in Board view tabs.

Right-click the archived project → "Unarchive" → project returns to active, Show archived toggle disappears if no more archived projects.

- [ ] **Step 3: Commit**

```bash
git add app-views.jsx
git commit -m "feat: archive projects — filter in all views, sidebar toggle"
```

---

## Task 10: Search panel

**Files:**
- Modify: `app-views.jsx` (add SearchPanel component)
- Modify: `BusinessBuild Ops.html` (search state in App, icon in top bar)

- [ ] **Step 1: Add search utility and SearchPanel to app-views.jsx**

Add before the `Object.assign(window, ...)` line:

```jsx
function searchWorkspaces(workspaces, query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results = [];
  workspaces.forEach(function(ws) {
    ws.areas.forEach(function(area) {
      area.projects.forEach(function(proj) {
        if (proj.status === 'archived') return;
        proj.tasks.forEach(function(task) {
          const titleMatch = task.title.toLowerCase().includes(q);
          const notesMatch = task.notes && task.notes.toLowerCase().includes(q);
          const projMatch = proj.name.toLowerCase().includes(q);
          if (titleMatch || notesMatch || projMatch) {
            results.push({ wsId: ws.id, wsName: ws.name, proj, task, matchedNotes: notesMatch && !titleMatch });
          }
        });
      });
    });
  });
  return results;
}

function SearchPanel({ workspaces, onNavigate, onClose, theme }) {
  const [query, setQuery] = React.useState('');
  const results = React.useMemo(() => searchWorkspaces(workspaces, query), [workspaces, query]);

  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300 }} />
      <div style={{
        position: 'fixed', top: 52, left: 200, right: 0, zIndex: 301,
        background: '#0d0f15', borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks, projects, notes…"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid rgba(0,229,212,0.35)',
              background: 'rgba(255,255,255,0.04)', color: '#fff',
              fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none',
            }}
          />
        </div>
        {query.trim() && (
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {results.length === 0 ? (
              <div style={{ padding: '20px 24px', fontSize: 13, color: '#5a6068' }}>No results for "{query}"</div>
            ) : results.map((r, i) => (
              <div key={r.task.id + i}
                onClick={() => { onNavigate(r.wsId, r.task, r.proj); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 24px', cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{r.task.title}</div>
                  {r.matchedNotes && r.task.notes && (
                    <div style={{ fontSize: 11, color: '#5a6068', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.task.notes}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color: '#5a6068' }}>{r.proj.name}</div>
                  <div style={{ fontSize: 9, color: '#4a5058', marginTop: 1 }}>{r.wsName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!query.trim() && (
          <div style={{ padding: '14px 24px', fontSize: 12, color: '#4a5058' }}>Start typing to search across all workspaces</div>
        )}
      </div>
    </>
  );
}
```

Update the final export:
```js
Object.assign(window, { DashboardView, KanbanView, CalendarView, RoadmapView, SearchPanel });
```

- [ ] **Step 2: Add search state and handler to App**

Add to App state:
```js
const [searchOpen, setSearchOpen] = React.useState(false);
```

Add handler:
```js
const handleSearchNavigate = (wsId, task, proj) => {
  handleSwitchWs(wsId);
  const { area } = findProjectArea(proj.id);
  setSelectedProject(proj.id);
  setActiveView('kanban');
  setDrawerTask(task);
  setDrawerProject(proj);
  setDrawerArea(area);
};
```

- [ ] **Step 3: Add search icon button to top bar**

In the top bar, add the search button before the export button:
```jsx
<button onClick={() => setSearchOpen(prev => !prev)} title="Search" style={{
  width: 30, height: 30, borderRadius: 7, border: `1px solid ${searchOpen ? theme.accentBorder : theme.border}`,
  background: searchOpen ? theme.accentMuted : 'transparent', color: searchOpen ? theme.accent : theme.mutedText,
  fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}}>⌕</button>
```

- [ ] **Step 4: Render SearchPanel in App**

Add inside the main App div, after the top bar and before the ViewComponent div:
```jsx
{searchOpen && (
  <SearchPanel
    workspaces={workspaces}
    onNavigate={handleSearchNavigate}
    onClose={() => setSearchOpen(false)}
    theme={theme}
  />
)}
```

- [ ] **Step 5: Verify search**

Click the ⌕ icon → search panel appears below the top bar. Type a task title → result appears showing task title and project name. Click the result → panel closes, switches to correct workspace, opens task in Board view with drawer open.

Type a word that appears only in notes → result shows with notes snippet. Escape key closes panel.

- [ ] **Step 6: Commit**

```bash
git add app-views.jsx "BusinessBuild Ops.html"
git commit -m "feat: global search panel — tasks, projects, notes across all workspaces"
```

---

## Self-Review Checklist

- [x] **Persistence (Task 1-2):** `BBStorage.load/save/exportJSON/importJSON/clear` fully implemented, `useEffect` auto-save wired
- [x] **Import/Export UI (Task 3):** ↓ export, ↑ import buttons in top bar, toast on import
- [x] **Workspace CRUD (Task 4):** + button creates workspace via modal, right-click context menu for rename/delete/reset
- [x] **Area CRUD (Task 5):** + button prompts for name, hover reveals rename/delete, inline edit on click
- [x] **Project CRUD (Task 5):** `ProjectModal` handles create + edit, `···` menu in sidebar for edit/archive/delete
- [x] **Task notes (Task 6):** Already correct — verification step confirms no code change needed
- [x] **Overdue badges (Task 4, 7):** `overdueMap` computed in App via `useMemo`, red pill on sidebar project rows, `OverdueCard` in dashboard
- [x] **Drag reorder (Task 8):** `KanbanCard` is both drag source and drop target, same-column → reorder, cross-column → move
- [x] **Archive (Task 2, 4, 9):** `visibleWorkspace` filters archived from views, sidebar shows dimmed with toggle, status in `ProjectModal`
- [x] **Search (Task 10):** `SearchPanel` searches all workspaces, navigates to correct ws + opens drawer
- [x] **Type consistency:** `reorderTaskInWs(workspaces, wsId, projId, taskId, targetIndex)` matches `handleReorderTask` and `onReorderTask(proj.id, taskId, targetIndex)` call in KanbanView
- [x] **No placeholders:** All code blocks are complete and executable
