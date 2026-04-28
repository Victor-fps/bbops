// Sidebar — Neo's Noir

function Sidebar({
  workspace, workspaces, onSwitchWorkspace, selectedProject, onSelectProject,
  activeView, onSetView, theme, overdueMap,
  onAddWorkspace, onRenameWorkspace, onDeleteWorkspace, onResetData,
  onAddArea, onRenameArea, onDeleteArea,
  onEditProject, onArchiveProject, onDeleteProject,
  showArchived, onToggleArchived,
}) {
  const [expandedAreas, setExpandedAreas] = React.useState(() => {
    const init = {};
    workspace.areas.forEach(a => { init[a.id] = true; });
    return init;
  });

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

  const [wsModal, setWsModal] = React.useState(null);
  const [ctxMenu, setCtxMenu] = React.useState(null);
  const [editingArea, setEditingArea] = React.useState(null);
  const [editingAreaName, setEditingAreaName] = React.useState('');
  const [projMenu, setProjMenu] = React.useState(null);

  const handleWsContextMenu = (e, ws) => {
    e.preventDefault();
    setCtxMenu({ wsId: ws.id, wsName: ws.name, x: e.clientX, y: e.clientY });
  };

  const closeCtxMenu = () => setCtxMenu(null);

  const handleDeleteWs = (wsId, wsName) => {
    closeCtxMenu();
    if (workspaces.length <= 1) { alert('At least one workspace is required.'); return; }
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
    onArchiveProject(projId, 'archived');
  };

  const handleUnarchiveProject = (projId) => {
    setProjMenu(null);
    onArchiveProject(projId, 'active');
  };

  const handleEditProjectClick = (projId) => {
    setProjMenu(null);
    const proj = workspace.areas.flatMap(a => a.projects).find(p => p.id === projId);
    if (proj) onEditProject(proj);
  };

  return (
    <>
      {(ctxMenu || projMenu) && (
        <div onClick={() => { setCtxMenu(null); setProjMenu(null); }}
          style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
      )}

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

      {projMenu && (
        <div style={{
          position: 'fixed', left: projMenu.x, top: projMenu.y,
          background: '#0d0f15', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '4px 0', zIndex: 201,
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)', minWidth: 150,
        }}>
          {[
            { label: 'Edit project', action: () => handleEditProjectClick(projMenu.projId) },
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
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,229,212,0.4), transparent)',
          filter: 'blur(0.5px)',
        }} />

        <div style={{ padding: '18px 16px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>BBOPS</span>
          <span style={{
            fontSize: 8, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
            background: 'rgba(0,229,212,0.12)', color: '#00e5d4', letterSpacing: '0.05em',
          }}>beta</span>
        </div>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px' }}
                onMouseEnter={e => { const el = e.currentTarget.querySelector('.area-actions'); if (el) el.style.opacity = '1'; }}
                onMouseLeave={e => { const el = e.currentTarget.querySelector('.area-actions'); if (el) el.style.opacity = '0'; }}
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

          {workspace.areas.some(a => a.projects.some(p => p.status === 'archived')) && (
            <button onClick={onToggleArchived} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '6px 10px', border: 'none', background: 'transparent',
              color: '#4a5058', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit',
              marginTop: 4,
            }}>{showArchived ? 'Hide archived' : 'Show archived'}</button>
          )}
        </div>

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
