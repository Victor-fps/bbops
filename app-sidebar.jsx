// Sidebar — Neo's Noir

function Sidebar({ workspace, workspaces, onSwitchWorkspace, selectedProject, onSelectProject, activeView, onSetView }) {
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
