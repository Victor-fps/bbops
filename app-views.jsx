// Views: Dashboard, Kanban, Calendar, Roadmap

// ── Shared helpers ──────────────────────────────────────────────────────────
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

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(due) {
  if (!due) return false;
  return new Date(due + 'T00:00:00') < new Date(new Date().toDateString());
}

// ── DASHBOARD ───────────────────────────────────────────────────────────────
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
  const area = `M ${pts.join(' L ')} L ${w},${h} L 0,${h} Z`;
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

// ── OVERDUE CARD ─────────────────────────────────────────────────────────────
function OverdueCard({ workspaces, onOpenTask }) {
  var today = new Date().toISOString().slice(0, 10);

  // Check if any task has a due date at all
  var anyDue = (workspaces || []).some(function(ws) {
    return (ws.areas || []).some(function(area) {
      return (area.projects || []).some(function(proj) {
        return (proj.tasks || []).some(function(t) { return !!t.due; });
      });
    });
  });

  // Collect all overdue tasks grouped by project, across all workspaces
  var groups = [];
  (workspaces || []).forEach(function(ws) {
    (ws.areas || []).forEach(function(area) {
      (area.projects || []).forEach(function(proj) {
        var overdueTasks = (proj.tasks || []).filter(function(t) {
          return t.due && t.due < today && t.status !== 'done';
        });
        if (overdueTasks.length > 0) {
          groups.push({ projectName: proj.name, proj: proj, tasks: overdueTasks });
        }
      });
    });
  });

  if (!anyDue) return null;

  var card = {
    background: '#0d0f15',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
  };

  if (groups.length === 0) {
    return (
      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Overdue</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#1de9b6' }}>
          <span style={{ fontSize: 14 }}>✓</span>
          <span>All clear — no overdue tasks</span>
        </div>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Overdue</div>
      {groups.map(function(group, gi) {
        return (
          <div key={group.proj.id}>
            <div style={{
              fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: '#5a6068',
              textTransform: 'uppercase', marginBottom: 4,
              marginTop: gi === 0 ? 0 : 10,
            }}>{group.projectName}</div>
            {group.tasks.map(function(task) {
              return (
                <div key={task.id}
                  onClick={function() { onOpenTask && onOpenTask(task, group.proj); }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 0', cursor: 'pointer',
                  }}
                  onMouseEnter={function(e) { e.currentTarget.style.opacity = '0.75'; }}
                  onMouseLeave={function(e) { e.currentTarget.style.opacity = '1'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                    <span style={{ color: '#fff', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                  </div>
                  <span style={{ color: '#ef4444', fontSize: 10, flexShrink: 0, marginLeft: 8 }}>{fmtDate(task.due)}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function DashboardView({ workspace, theme, onOpenTask, onNewProject }) {
  const allProjects = workspace.areas.flatMap(a => a.projects.map(p => ({ ...p, areaName: a.name })));
  const allTasks = allProjects.flatMap(p => p.tasks);

  const openCount = allTasks.filter(t => t.status !== 'done').length;
  const inProgressCount = allTasks.filter(t => t.status === 'in-progress').length;
  const doneCount = allTasks.filter(t => t.status === 'done').length;
  const doneRate = allTasks.length > 0 ? Math.round(doneCount / allTasks.length * 100) : 0;

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
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, activeProjects.length)}, 1fr)`, gap: 10 }}>
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

        {/* 8. Overdue — full width row 4 */}
        <div style={{ gridColumn: '1 / -1' }}>
          <OverdueCard
            workspaces={[workspace]}
            onOpenTask={onOpenTask}
          />
        </div>

      </div>
    </div>
  );
}

// ── KANBAN ───────────────────────────────────────────────────────────────────
const COL_ORDER = ['todo', 'in-progress', 'done'];
const COL_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };
const COL_ACCENTS = { 'todo': '#5a6068', 'in-progress': '#00e5d4', 'done': '#1de9b6' };

function KanbanView({ workspace, selectedProject, theme, onOpenTask, onMoveTask, onAddTask, onReorderTask }) {
  const allProjects = workspace.areas.flatMap(a => a.projects);
  const [activeProjectId, setActiveProjectId] = React.useState(
    selectedProject || allProjects[0]?.id
  );
  React.useEffect(() => {
    if (selectedProject) setActiveProjectId(selectedProject);
  }, [selectedProject]);

  const proj = allProjects.find(p => p.id === activeProjectId) || allProjects[0];
  const [dragOver, setDragOver] = React.useState(null);
  const [dragOverTaskId, setDragOverTaskId] = React.useState(null);
  const [addingTo, setAddingTo] = React.useState(null); // column id

  const move = (taskId, toStatus) => onMoveTask && onMoveTask(proj.id, taskId, toStatus);
  const reorder = (taskId, targetTaskId) => onReorderTask && onReorderTask(proj.id, taskId, targetTaskId);

  return (
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Project tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: theme.mutedText, fontFamily: 'inherit', marginRight: 6 }}>PROJECT</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {allProjects.map(p => (
            <button key={p.id} onClick={() => setActiveProjectId(p.id)}
              style={{
                padding: '5px 13px', borderRadius: 7,
                border: `1.5px solid ${activeProjectId === p.id ? theme.accent : theme.border}`,
                background: activeProjectId === p.id ? `${theme.accentMuted}` : 'transparent',
                color: activeProjectId === p.id ? theme.text : theme.mutedText,
                fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.12s',
              }}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, flex: 1, overflow: 'hidden' }}>
        {COL_ORDER.map(colId => {
          const tasks = (proj?.tasks || []).filter(t => t.status === colId);
          const accent = COL_ACCENTS[colId] || theme.mutedText;
          const isOver = dragOver === colId;
          return (
            <div key={colId}
              onDragOver={e => { e.preventDefault(); setDragOver(colId); }}
              onDragLeave={e => {
                // Only clear column highlight if not entering a child
                if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null);
              }}
              onDrop={e => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('taskId');
                const fromStatus = e.dataTransfer.getData('taskStatus');
                // Only handle drops directly on column (not on a card — cards handle their own drops)
                if (taskId && fromStatus !== colId) move(taskId, colId);
                setDragOver(null);
                setDragOverTaskId(null);
              }}
              style={{
                display: 'flex', flexDirection: 'column',
                background: isOver ? `${accent}10` : theme.columnBg,
                borderRadius: 14, padding: '14px 12px',
                border: `1.5px solid ${isOver ? accent + '60' : theme.border}`,
                transition: 'all 0.15s', overflow: 'hidden',
              }}>
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${theme.border}` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent || theme.border, flexShrink: 0 }}></div>
                <span style={{ fontSize: 12, fontWeight: 700, color: theme.text, flex: 1 }}>{COL_LABELS[colId]}</span>
                <span style={{ fontSize: 10, color: theme.mutedText, fontFamily: 'inherit' }}>{tasks.length}</span>
                <button onClick={() => setAddingTo(colId)} style={{
                  width: 22, height: 22, borderRadius: 5, border: `1px solid ${theme.border}`,
                  background: 'transparent', color: theme.mutedText, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                }}>+</button>
              </div>

              {/* Cards */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.map(t => (
                  <KanbanCard key={t.id} task={t} colId={colId} theme={theme}
                    onOpen={() => onOpenTask(t, proj)}
                    onMove={move}
                    onReorder={reorder}
                    isDragOver={dragOverTaskId === t.id}
                    onDragOverTask={id => { setDragOverTaskId(id); setDragOver(null); }}
                    onDragLeaveTask={() => setDragOverTaskId(null)} />
                ))}
                {tasks.length === 0 && !isOver && (
                  <div style={{ border: `1.5px dashed ${theme.border}`, borderRadius: 10, height: 72,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 11, color: theme.border }}>drop here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick-add modal */}
      {addingTo && (
        <NewTaskModal theme={theme} defaultStatus={addingTo}
          onSave={task => onAddTask && onAddTask(proj.id, task)}
          onClose={() => setAddingTo(null)} />
      )}
    </div>
  );
}

function KanbanCard({ task, colId, theme, onOpen, onMove, onReorder, isDragOver, onDragOverTask, onDragLeaveTask }) {
  const colIdx = COL_ORDER.indexOf(colId);
  const overdue = isOverdue(task.due) && task.status !== 'done';

  return (
    <div>
      {/* Drop indicator: cyan line above this card when dragging a same-column task over it */}
      {isDragOver && (
        <div style={{ height: 2, background: '#00e5d4', borderRadius: 2, marginBottom: 4, boxShadow: '0 0 6px #00e5d480' }} />
      )}
      <div
        draggable
        onDragStart={e => {
          e.dataTransfer.setData('taskId', task.id);
          e.dataTransfer.setData('taskStatus', task.status);
        }}
        onDragOver={e => {
          e.preventDefault();
          e.stopPropagation();
          onDragOverTask && onDragOverTask(task.id);
        }}
        onDragLeave={e => {
          e.stopPropagation();
          onDragLeaveTask && onDragLeaveTask();
        }}
        onDrop={e => {
          e.preventDefault();
          e.stopPropagation();
          const draggedId = e.dataTransfer.getData('taskId');
          const fromStatus = e.dataTransfer.getData('taskStatus');
          if (draggedId && draggedId !== task.id) {
            if (fromStatus === colId) {
              // Same column: reorder
              onReorder && onReorder(draggedId, task.id);
            } else {
              // Different column: move (status change)
              onMove && onMove(draggedId, colId);
            }
          }
          onDragLeaveTask && onDragLeaveTask();
        }}
        onClick={onOpen}
        style={{
          background: theme.surface, borderRadius: 10, padding: '12px 13px',
          border: `1px solid ${overdue ? 'rgba(244,117,117,0.5)' : 'rgba(255,255,255,0.05)'}`,
          boxShadow: theme.cardShadow, cursor: 'pointer',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = theme.cardShadowHover; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = theme.cardShadow; }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text, lineHeight: 1.4, marginBottom: 8 }}>{task.title}</div>
        {task.notes && <div style={{ fontSize: 11, color: theme.mutedText, marginBottom: 8, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.notes}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {priorityBadge(task.priority)}
          {task.due && <span style={{ fontSize: 10, fontFamily: 'inherit', color: overdue ? '#f47575' : '#5a6068', marginLeft: 2 }}>
            {overdue ? '⚠ ' : ''}{fmtDate(task.due)}
          </span>}
          {/* Move arrows */}
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
    </div>
  );
}

function arrowBtnStyle(theme) {
  return {
    width: 22, height: 22, borderRadius: 5, border: `1px solid ${theme.border}`,
    background: 'transparent', color: theme.mutedText, fontSize: 12,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'inherit', transition: 'all 0.1s', lineHeight: 1,
  };
}

// ── CALENDAR ─────────────────────────────────────────────────────────────────
function CalendarView({ workspace, theme, onOpenTask }) {
  const [month, setMonth] = React.useState(new Date(2026, 3, 1));
  const allProjects = workspace.areas.flatMap(a => a.projects);
  const allTasks = allProjects.flatMap(p => p.tasks.filter(t => t.due));

  const year = month.getFullYear(), mo = month.getMonth();
  const firstDay = new Date(year, mo, 1).getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();

  const tasksByDay = {};
  allTasks.forEach(t => {
    const d = new Date(t.due + 'T00:00:00');
    if (d.getFullYear() === year && d.getMonth() === mo) {
      const k = d.getDate();
      if (!tasksByDay[k]) tasksByDay[k] = [];
      tasksByDay[k].push(t);
    }
  });

  const today = new Date();
  const isToday = (d) => d === today.getDate() && mo === today.getMonth() && year === today.getFullYear();
  const taskProject = (t) => allProjects.find(p => p.tasks.find(x => x.id === t.id));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ padding: '24px 28px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <button onClick={() => setMonth(new Date(year, mo - 1, 1))} style={calNavBtn(theme)}>‹</button>
        <span style={{ fontSize: 18, fontWeight: 700, color: theme.text, fontFamily: 'Inter, sans-serif', minWidth: 200, textAlign: 'center' }}>
          {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => setMonth(new Date(year, mo + 1, 1))} style={calNavBtn(theme)}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: theme.mutedText, textAlign: 'center', padding: '6px 0', fontFamily: 'inherit' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {cells.map((d, i) => (
          <div key={i} style={{
            background: d && isToday(d) ? `${theme.accent}15` : theme.surface,
            border: `1px solid ${d && isToday(d) ? theme.accent + '80' : theme.border}`,
            borderRadius: 10, padding: '8px', minHeight: 88,
            boxShadow: theme.cardShadow,
          }}>
            {d && <>
              <div style={{ fontSize: 11, fontWeight: isToday(d) ? 700 : 500, color: isToday(d) ? theme.accent : theme.mutedText, marginBottom: 5 }}>{d}</div>
              {(tasksByDay[d] || []).map(t => (
                <div key={t.id} onClick={() => onOpenTask && onOpenTask(t, taskProject(t))}
                  style={{
                    fontSize: 10, padding: '2px 5px', borderRadius: 4, marginBottom: 2, lineHeight: 1.35,
                    background: t.status === 'done' ? 'rgba(29,233,182,0.12)' : t.status === 'in-progress' ? 'rgba(0,229,212,0.12)' : 'rgba(255,255,255,0.05)',
                    color: t.status === 'done' ? '#1de9b6' : t.status === 'in-progress' ? '#00e5d4' : '#5a6068',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}>{t.title}</div>
              ))}
            </>}
          </div>
        ))}
      </div>
    </div>
  );
}

function calNavBtn(theme) {
  return {
    width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18,
    fontFamily: 'inherit', background: theme.surface,
    border: `1px solid ${theme.border}`, color: theme.text,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: theme.cardShadow,
  };
}

// ── ROADMAP ───────────────────────────────────────────────────────────────────
function RoadmapView({ workspace, theme }) {
  const minDate = new Date('2026-03-01');
  const maxDate = new Date('2026-09-30');
  const totalDays = (maxDate - minDate) / 86400000;

  const months = [];
  let cur = new Date(minDate);
  while (cur <= maxDate) { months.push(new Date(cur)); cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1); }

  const toPct = (ds) => {
    const d = new Date(ds + 'T00:00:00');
    return Math.max(0, Math.min(100, ((d - minDate) / 86400000) / totalDays * 100));
  };

  const today = new Date();
  const todayPct = toPct(today.toISOString().split('T')[0]);

  const statusAccent = (s) => s === 'active' ? '#00e5d4' : s === 'done' ? '#1de9b6' : '#5a6068';

  return (
    <div style={{ padding: '28px 32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: theme.mutedText, marginBottom: 18, fontFamily: 'inherit' }}>
        TIMELINE — Mar 2026 → Sep 2026
      </div>

      <div style={{ marginLeft: 210, position: 'relative', height: 30, marginBottom: 2, borderBottom: `1px solid ${theme.border}` }}>
        {months.map((m, i) => (
          <div key={i} style={{ position: 'absolute', left: `${toPct(m.toISOString().split('T')[0])}%`, fontSize: 10, fontWeight: 600, color: theme.mutedText, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {m.toLocaleDateString('en-US', { month: 'short' })}
          </div>
        ))}
        <div style={{ position: 'absolute', left: `${todayPct}%`, top: 0, bottom: -1, width: 2, background: theme.accent, opacity: 0.9 }}></div>
      </div>

      {workspace.areas.map(area => (
        <React.Fragment key={area.id}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: theme.mutedText, padding: '12px 0 4px', fontFamily: 'inherit' }}>
            {area.name.toUpperCase()}
          </div>
          {area.projects.map(proj => (
            <div key={proj.id} style={{ display: 'flex', alignItems: 'center', height: 40, marginBottom: 3 }}>
              <div style={{ width: 210, flexShrink: 0, paddingRight: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proj.name}</div>
              </div>
              <div style={{ flex: 1, position: 'relative', height: 30 }}>
                <div style={{ position: 'absolute', left: `${todayPct}%`, top: 0, bottom: 0, width: 1, background: theme.accent, opacity: 0.2 }}></div>
                {proj.startDate && proj.endDate && (
                  <div style={{
                    position: 'absolute',
                    left: `${toPct(proj.startDate)}%`,
                    width: `${toPct(proj.endDate) - toPct(proj.startDate)}%`,
                    top: '50%', transform: 'translateY(-50%)',
                    height: 22, borderRadius: 6,
                    background: `${statusAccent(proj.status)}18`,
                    border: `1.5px solid ${statusAccent(proj.status)}55`,
                    overflow: 'hidden',
                  }}>
                    <div style={{ width: `${proj.progress}%`, height: '100%', background: `${statusAccent(proj.status)}35` }}></div>
                  </div>
                )}
              </div>
              <div style={{ width: 38, textAlign: 'right', fontSize: 10, color: theme.mutedText, fontFamily: 'inherit', flexShrink: 0 }}>{proj.progress}%</div>
            </div>
          ))}
        </React.Fragment>
      ))}

      <div style={{ marginTop: 24, display: 'flex', gap: 18 }}>
        {[['active', 'Active', theme.accent], ['planned', 'Planned', theme.mutedText], ['done', 'Done', '#1de9b6']].map(([s,l,c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 4, borderRadius: 2, background: c }}></div>
            <span style={{ fontSize: 11, color: theme.mutedText }}>{l}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 2, height: 14, background: theme.accent }}></div>
          <span style={{ fontSize: 11, color: theme.mutedText }}>Today</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardView, KanbanView, CalendarView, RoadmapView });
