// TaskDrawer, NewTaskModal, NewProjectModal

const STATUSES = ['todo', 'in-progress', 'done'];
const STATUS_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };
const PRIORITIES = ['low', 'medium', 'high'];

// ── Task Drawer ───────────────────────────────────────────────────────────────
function TaskDrawer({ task, project, area, theme, onClose, onUpdate, onDelete }) {
  const [editing, setEditing] = React.useState({ ...task });

  React.useEffect(() => { setEditing({ ...task }); }, [task?.id]);

  const save = (field, val) => {
    const updated = { ...editing, [field]: val };
    setEditing(updated);
    onUpdate(updated);
  };

  if (!task) return null;

  const statusColors = {
    'todo':        { bg: 'rgba(255,255,255,0.05)', color: '#5a6068',  border: 'rgba(255,255,255,0.1)' },
    'in-progress': { bg: 'rgba(0,229,212,0.12)',   color: '#00e5d4',  border: 'rgba(0,229,212,0.35)' },
    'done':        { bg: 'rgba(29,233,182,0.12)',  color: '#1de9b6',  border: 'rgba(29,233,182,0.35)' },
  };
  const priorityColors = {
    high:   { bg: 'rgba(244,117,117,0.12)', color: '#f47575', border: 'rgba(244,117,117,0.35)' },
    medium: { bg: 'rgba(138,130,245,0.12)', color: '#8a82f5', border: 'rgba(138,130,245,0.35)' },
    low:    { bg: 'rgba(255,255,255,0.05)', color: '#5a6068', border: 'rgba(255,255,255,0.1)' },
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 100,
        backdropFilter: 'blur(2px)',
      }} />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: '#0d0f15', zIndex: 101, display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
        animation: 'slideIn 0.22s cubic-bezier(0.22,1,0.36,1)',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#5a6068', marginBottom: 6, fontFamily: 'inherit' }}>
                {area?.name?.toUpperCase()} › {project?.name}
              </div>
              <textarea
                value={editing.title}
                onChange={e => save('title', e.target.value)}
                style={{
                  fontSize: 16, fontWeight: 600, color: '#fff', border: 'none',
                  background: 'transparent', width: '100%', resize: 'none',
                  fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.4, outline: 'none',
                  padding: 0,
                }}
                rows={2}
              />
            </div>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent', color: '#5a6068', fontSize: 16,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>×</button>
          </div>
        </div>

        {/* Fields */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Status */}
          <DrawerField label="Status" theme={theme}>
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUSES.map(s => {
                const c = statusColors[s];
                return (
                  <button key={s} onClick={() => save('status', s)} style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    border: `1.5px solid ${editing.status === s ? c.border : 'rgba(255,255,255,0.08)'}`,
                    background: editing.status === s ? c.bg : 'transparent',
                    color: editing.status === s ? c.color : '#5a6068',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                  }}>{STATUS_LABELS[s]}</button>
                );
              })}
            </div>
          </DrawerField>

          {/* Priority */}
          <DrawerField label="Priority" theme={theme}>
            <div style={{ display: 'flex', gap: 6 }}>
              {PRIORITIES.map(p => {
                const c = priorityColors[p];
                return (
                  <button key={p} onClick={() => save('priority', p)} style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    border: `1.5px solid ${editing.priority === p ? c.border : 'rgba(255,255,255,0.08)'}`,
                    background: editing.priority === p ? c.bg : 'transparent',
                    color: editing.priority === p ? c.color : '#5a6068',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                    textTransform: 'capitalize',
                  }}>{p}</button>
                );
              })}
            </div>
          </DrawerField>

          {/* Due date */}
          <DrawerField label="Due Date" theme={theme}>
            <input type="date" value={editing.due || ''} onChange={e => save('due', e.target.value)}
              style={{
                padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 13,
                fontFamily: 'inherit', outline: 'none',
              }} />
          </DrawerField>

          {/* Notes */}
          <DrawerField label="Notes" theme={theme}>
            <textarea value={editing.notes || ''} onChange={e => save('notes', e.target.value)}
              placeholder="Add notes, context, or next steps…"
              rows={5}
              style={{
                ...drawerInputStyle(),
                resize: 'vertical', lineHeight: 1.6, width: '100%',
              }} />
          </DrawerField>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => { onDelete(task.id); onClose(); }} style={{
            fontSize: 12, color: '#f47575', background: 'transparent',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>Delete task</button>
          <button onClick={onClose} style={{
            padding: '8px 20px', borderRadius: 8, background: '#00e5d4',
            border: 'none', color: '#001a17', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Done</button>
        </div>
      </div>
    </>
  );
}

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

function DrawerField({ label, children, theme }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#5a6068', marginBottom: 8, fontFamily: 'inherit' }}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

function DrawerFieldInline({ label, children, theme }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#5a6068', marginBottom: 8, fontFamily: 'inherit' }}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

// ── New Task Modal ────────────────────────────────────────────────────────────
function NewTaskModal({ theme, defaultStatus, onSave, onClose }) {
  const [form, setForm] = React.useState({ title: '', status: defaultStatus || 'todo', priority: 'medium', due: '', notes: '' });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <ModalShell title="New Task" theme={theme} onClose={onClose} onSave={() => {
      if (!form.title.trim()) return;
      onSave({ ...form, id: 'task-' + Date.now() });
      onClose();
    }}>
      <DrawerField label="Title" theme={theme}>
        <input autoFocus value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="What needs to get done?"
          style={drawerInputStyle()} />
      </DrawerField>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <DrawerFieldInline label="Status" theme={theme}>
          <select value={form.status} onChange={e => set('status', e.target.value)} style={drawerInputStyle()}>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </DrawerFieldInline>
        <DrawerFieldInline label="Priority" theme={theme}>
          <select value={form.priority} onChange={e => set('priority', e.target.value)} style={drawerInputStyle()}>
            {PRIORITIES.map(p => <option key={p} value={p} style={{ textTransform: 'capitalize' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </DrawerFieldInline>
      </div>
      <DrawerField label="Due Date" theme={theme}>
        <input type="date" value={form.due} onChange={e => set('due', e.target.value)} style={drawerInputStyle()} />
      </DrawerField>
      <DrawerField label="Notes" theme={theme}>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Optional notes…" rows={3}
          style={{ ...drawerInputStyle(), resize: 'vertical', lineHeight: 1.6, width: '100%' }} />
      </DrawerField>
    </ModalShell>
  );
}

// ── Project Modal (create + edit) ─────────────────────────────────────────────
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

// ── Modal Shell ───────────────────────────────────────────────────────────────
function ModalShell({ title, theme, onClose, onSave, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 480, background: '#0d0f15', borderRadius: 18, zIndex: 201,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        animation: 'modalIn 0.18s cubic-bezier(0.22,1,0.36,1)',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}>
        <style>{`@keyframes modalIn { from { transform: translate(-50%,-50%) scale(0.94); opacity:0; } to { transform: translate(-50%,-50%) scale(1); opacity:1; } }`}</style>
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: "'Inter', sans-serif" }}>{title}</span>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#5a6068', fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '20px 24px 0' }}>{children}</div>
        <div style={{ padding: '14px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#5a6068', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={onSave} style={{ padding: '8px 20px', borderRadius: 8, background: '#00e5d4', border: 'none', color: '#001a17', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
        </div>
      </div>
    </>
  );
}

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
        onSave({ name: form.name.trim(), abbr: (form.abbr.trim().slice(0,2) || autoAbbr(form.name)).toUpperCase(), color: form.color });
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

Object.assign(window, { TaskDrawer, NewTaskModal, ProjectModal, WorkspaceModal });
