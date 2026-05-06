const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// Serve the app at root (filename has a space so no auto index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'BusinessBuild Ops.html'));
});

// Only connect to DB if DATABASE_URL is set
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

async function initDb() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_data (
      id INTEGER PRIMARY KEY DEFAULT 1,
      workspaces JSONB NOT NULL DEFAULT '[]',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    INSERT INTO app_data (id, workspaces) VALUES (1, '[]') ON CONFLICT (id) DO NOTHING;
  `);
}

// GET /api/data — load workspaces from DB
app.get('/api/data', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database configured' });
  try {
    const result = await pool.query('SELECT workspaces FROM app_data WHERE id = 1');
    res.json({ workspaces: result.rows[0]?.workspaces || [] });
  } catch (err) {
    console.error('GET /api/data error:', err);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// POST /api/data — save workspaces to DB
app.post('/api/data', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'No database configured' });
  try {
    const { workspaces } = req.body;
    if (!Array.isArray(workspaces)) return res.status(400).json({ error: 'Invalid data' });
    await pool.query(
      `INSERT INTO app_data (id, workspaces, updated_at) VALUES (1, $1, NOW())
       ON CONFLICT (id) DO UPDATE SET workspaces = $1, updated_at = NOW()`,
      [JSON.stringify(workspaces)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/data error:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

initDb()
  .catch(err => console.error('DB init error (continuing anyway):', err))
  .finally(() => {
    app.listen(PORT, () => console.log('BBOps running on port ' + PORT));
  });
