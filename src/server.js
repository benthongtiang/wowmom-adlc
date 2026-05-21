'use strict';

const express = require('express');
const { sequelize, Mother, Leader, Group, Application } = require('./models');
const { APPLICATION_STATES, GROUP_STATUSES } = require('./models/constants');
const { ApplicationService, InterviewService } = require('./services');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global variables to hold active seed IDs for interactive simulation
let seededMotherId;
let seededGroupId;

/**
 * Helper to get active database state
 */
async function getSystemState() {
  const groups = await Group.findAll({
    include: [
      {
        model: Leader,
        as: 'leader',
        attributes: ['full_name', 'email', 'phone'],
      },
    ],
  });

  const applications = await Application.findAll({
    include: [
      {
        model: Mother,
        as: 'mother',
        attributes: ['full_name', 'email', 'phone', 'children_ages'],
      },
      {
        model: Group,
        as: 'group',
        attributes: ['group_name', 'max_capacity', 'current_member_count', 'group_status'],
      },
    ],
    order: [['application_date', 'DESC']],
  });

  return { groups, applications };
}

// --------------------------------------------------------
// REST API Routes for Live UI Controls
// --------------------------------------------------------

app.get('/api/state', async (req, res) => {
  try {
    const state = await getSystemState();
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/apply', async (req, res) => {
  try {
    const { groupId } = req.body;
    const application = await ApplicationService.submitApplication({
      motherId: seededMotherId,
      groupId: groupId || seededGroupId,
    });
    res.json({ success: true, application });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/propose', async (req, res) => {
  try {
    const { applicationId } = req.body;
    const application = await InterviewService.proposeSlots(applicationId, [
      'Tomorrow at 09:00 AM',
      'Next Tuesday at 02:00 PM',
    ]);
    res.json({ success: true, application });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/confirm', async (req, res) => {
  try {
    const { applicationId, slot } = req.body;
    const application = await InterviewService.confirmSlot(applicationId, slot || 'Tomorrow at 09:00 AM');
    res.json({ success: true, application });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/accept', async (req, res) => {
  try {
    const { applicationId } = req.body;
    const application = await ApplicationService.acceptApplication(applicationId);
    res.json({ success: true, application });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/activate', async (req, res) => {
  try {
    const { applicationId } = req.body;
    const application = await ApplicationService.activateParticipant(applicationId);
    res.json({ success: true, application });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/reset', async (req, res) => {
  try {
    await seedInitialData();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------
// Embedded Premium HTML UI Client Interface
// --------------------------------------------------------

app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WoW Mom Platform — Interactive Control Panel</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #ec4899;
      --primary-hover: #db2777;
      --secondary: #8b5cf6;
      --bg: #0f172a;
      --surface: #1e293b;
      --surface-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --success: #10b981;
      --warning: #f59e0b;
      --info: #3b82f6;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', system-ui, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Premium Glassmorphism Navbar */
    header {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--surface-border);
      padding: 1rem 2rem;
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #f43f5e, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .status-badge {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background-color: rgba(16, 185, 129, 0.15);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    main {
      padding: 2rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media(min-width: 1024px) {
      main { grid-template-columns: 350px 1fr; }
    }

    /* Left Sidebar Panel */
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .card:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
      border-color: rgba(236, 72, 153, 0.3);
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--primary);
    }

    .persona-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
      color: white;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: inherit;
      font-weight: 600;
      font-size: 0.9rem;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
      margin-top: 0.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);
    }

    .btn-primary:hover {
      opacity: 0.95;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
    }

    .btn-outline {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--surface-border);
    }

    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--text-muted);
    }

    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
      width: auto;
    }

    .btn-success { background: var(--success); color: white; }
    .btn-info { background: var(--info); color: white; }
    
    /* Main Content Dashboard */
    .content-area {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid var(--surface-border);
      background: var(--surface);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th {
      background: rgba(15, 23, 42, 0.5);
      padding: 1rem;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--surface-border);
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      font-size: 0.95rem;
    }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 6px;
      text-transform: capitalize;
    }

    .badge-pending { background: rgba(245, 158, 11, 0.2); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.4); }
    .badge-interview { background: rgba(59, 130, 246, 0.2); color: var(--info); border: 1px solid rgba(59, 130, 246, 0.4); }
    .badge-accepted { background: rgba(16, 185, 129, 0.2); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.4); }
    .badge-active { background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2)); color: var(--primary); border: 1px solid rgba(236, 72, 153, 0.4); }
    .badge-full { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4); }

    .toast-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 100;
    }

    .toast {
      background: #0f172a;
      border: 1px solid var(--primary);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from { transform: translateY(100%) opacity: 0; }
      to { transform: translateY(0) opacity: 1; }
    }

    .error-box {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid #ef4444;
      padding: 1rem;
      border-radius: 8px;
      color: #fca5a5;
      margin-bottom: 1rem;
      display: none;
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      ✨ WoW Mom Platform UI Auto Deploy
    </div>
    <div class="status-badge">
      ● Connected to Live In-Memory API
    </div>
  </header>

  <main>
    <!-- Left Interaction Persona Controls -->
    <div class="sidebar">
      
      <!-- Mother View Controls -->
      <div class="card">
        <div class="card-title">👩‍👧 Mother Candidate Profile</div>
        <div class="persona-profile">
          <div class="avatar">AL</div>
          <div>
            <div style="font-weight: 600;">Ada Lovelace</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">ada.lovelace@example.com</div>
          </div>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Seeking support community. Concurrency limit protected (max 3).
        </p>
        <button class="btn btn-primary" onclick="submitApplication()">
          ⚡ Submit New Application
        </button>
      </div>

      <!-- System Reset Simulation -->
      <div class="card">
        <div class="card-title">⚙️ Test Harness Controls</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Reset local seed database tables to initial pristine state anytime.
        </p>
        <button class="btn btn-outline" onclick="resetDatabase()">
          🔄 Refresh/Reset Seed Database
        </button>
      </div>

    </div>

    <!-- Right Live Dynamic Telemetry & Matrix View -->
    <div class="content-area">
      
      <div id="errorAlert" class="error-box"></div>

      <!-- Groups Matrix Section -->
      <div class="card" style="padding: 0;">
        <div style="padding: 1.5rem; border-bottom: 1px solid var(--surface-border); display: flex; justify-content: space-between; align-items: center;">
          <h2 class="card-title" style="margin: 0;">🏢 Active Local Support Groups</h2>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Capacity Gated</span>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Leader</th>
                <th>Capacity Gated Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="groupsTableBody">
              <tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Loading groups...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Application Pipeline Stages Section -->
      <div class="card" style="padding: 0;">
        <div style="padding: 1.5rem; border-bottom: 1px solid var(--surface-border);">
          <h2 class="card-title" style="margin: 0;">📋 Live Application Lifecycle Matrix</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
            Leader / Admin interactive approval queue workflows
          </p>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Target Group</th>
                <th>Pipeline State</th>
                <th>Lifecycle Action Gateway</th>
              </tr>
            </thead>
            <tbody id="appsTableBody">
              <tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No active intake applications found.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </main>

  <div class="toast-container" id="toastContainer"></div>

  <script>
    // Live UI Control Dashboard Logic
    async function loadSystemState() {
      try {
        const res = await fetch('/api/state');
        const state = await res.json();
        renderGroups(state.groups);
        renderApplications(state.applications);
      } catch (err) {
        showError("Failed to synchronize active state: " + err.message);
      }
    }

    function renderGroups(groups) {
      const tbody = document.getElementById('groupsTableBody');
      if (!groups || groups.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No groups available.</td></tr>';
        return;
      }

      tbody.innerHTML = groups.map(g => {
        const isFull = g.group_status === 'Full' || g.current_member_count >= g.max_capacity;
        const badgeClass = isFull ? 'badge-full' : 'badge-accepted';
        const badgeText = isFull ? 'Capacity Reached' : 'Available Available';

        return \`
          <tr>
            <td style="font-weight: 600;">\${g.group_name}</td>
            <td>\${g.leader ? g.leader.full_name : 'Unassigned'}</td>
            <td>
              <span class="badge \${badgeClass}">\${badgeText}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.5rem;">
                (\${g.current_member_count}/\${g.max_capacity} active)
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-outline" onclick="submitApplication('\${g.group_id}')" \${isFull ? 'disabled' : ''}>
                \${isFull ? '🔒 Gated' : 'Apply Now'}
              </button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function renderApplications(apps) {
      const tbody = document.getElementById('appsTableBody');
      if (!apps || apps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No active intake applications found. Click "Submit New Application" on the left to start.</td></tr>';
        return;
      }

      tbody.innerHTML = apps.map(app => {
        let badgeClass = 'badge-pending';
        if (app.status === 'Interview Scheduled') badgeClass = 'badge-interview';
        if (app.status === 'Accepted') badgeClass = 'badge-accepted';
        if (app.status === 'Active Participant') badgeClass = 'badge-active';

        // Conditional interactive Gateway actions for each lifecycle status
        let actionsHtml = '';
        if (app.status === 'Pending') {
          actionsHtml = \`
            <button class="btn btn-sm btn-info" onclick="triggerAction('/api/propose', '\${app.application_id}')">
              📅 Propose Interview Slots
            </button>
            <button class="btn btn-sm btn-success" onclick="triggerAction('/api/accept', '\${app.application_id}')" style="margin-left: 4px;">
              ✓ Direct Accept
            </button>
          \`;
        } else if (app.status === 'Interview Scheduled') {
          actionsHtml = \`
            <div style="font-size: 0.75rem; color: var(--info); margin-bottom: 4px;">
              \${app.interview_confirmed_by_mother ? '✓ Confirmed by Mother' : '⏳ Awaiting Mother Confirmation'}
            </div>
            \${!app.interview_confirmed_by_mother ? \`
              <button class="btn btn-sm btn-outline" onclick="triggerAction('/api/confirm', '\${app.application_id}')">
                🔒 Simulate Mother Locking Slot
              </button>
            \` : \`
              <button class="btn btn-sm btn-success" onclick="triggerAction('/api/accept', '\${app.application_id}')">
                ✓ Approve Candidate Post-Interview
              </button>
            \`}
          \`;
        } else if (app.status === 'Accepted') {
          actionsHtml = \`
            <button class="btn btn-sm btn-primary" onclick="triggerAction('/api/activate', '\${app.application_id}')">
              🚀 Activate Participant (Increment Counter)
            </button>
          \`;
        } else if (app.status === 'Active Participant') {
          actionsHtml = \`
            <span style="font-size: 0.8rem; color: var(--success);">✓ Activated in Group Roster</span>
          \`;
        }

        return \`
          <tr>
            <td>
              <div style="font-weight: 600;">\${app.mother ? app.mother.full_name : 'Candidate'}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Applied: \${new Date(app.application_date).toLocaleDateString()}</div>
            </td>
            <td>\${app.group ? app.group.group_name : 'Group'}</td>
            <td><span class="badge \${badgeClass}">\${app.status}</span></td>
            <td>\${actionsHtml}</td>
          </tr>
        \`;
      }).join('');
    }

    async function submitApplication(groupId) {
      hideError();
      try {
        const res = await fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Submission failed');
        
        showToast('✨ Application successfully submitted!');
        loadSystemState();
      } catch (err) {
        showError(err.message);
      }
    }

    async function triggerAction(endpoint, applicationId) {
      hideError();
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Action failed');

        showToast('🚀 Lifecycle phase successfully transitioned!');
        loadSystemState();
      } catch (err) {
        showError(err.message);
      }
    }

    async function resetDatabase() {
      hideError();
      try {
        const res = await fetch('/api/reset', { method: 'POST' });
        if (!res.ok) throw new Error('Reset failed');
        showToast('🔄 Database tables seeded and refreshed successfully');
        loadSystemState();
      } catch (err) {
        showError(err.message);
      }
    }

    function showToast(msg) {
      const c = document.getElementById('toastContainer');
      const t = document.createElement('div');
      t.className = 'toast';
      t.innerHTML = \`<span>📢</span><div>\${msg}</div>\`;
      c.appendChild(t);
      setTimeout(() => t.remove(), 3500);
    }

    function showError(msg) {
      const b = document.getElementById('errorAlert');
      b.innerHTML = '⚠️ <strong>Validation Barrier Blocked:</strong> ' + msg;
      b.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function hideError() {
      document.getElementById('errorAlert').style.display = 'none';
    }

    // Auto-load state on start
    window.addEventListener('DOMContentLoaded', loadSystemState);
  </script>
</body>
</html>`;
  res.send(html);
});

// --------------------------------------------------------
// Initial Seed Logic function
// --------------------------------------------------------

async function seedInitialData() {
  await sequelize.sync({ force: true });
  logger.info('Database schema clean setup completed.');

  const leader = await Leader.create({
    full_name: 'Grace Hopper',
    email: 'grace.leader@wowmom.org',
    password_hash: '$2b$10$samplehashedpassword',
    phone: '555-0199',
    approved_by_admin: true,
  });

  const group = await Group.create({
    group_name: 'Downtown Sunrise Circle',
    description: 'Supportive community for early rising mothers.',
    leader_id: leader.leader_id,
    meeting_time: 'Morning',
    address: '100 Peace Plaza',
    max_capacity: 2, // Set small capacity to easily demo Full state dynamic tag blocking
    current_member_count: 0,
    meeting_frequency: 'Weekly',
  });

  const mother = await Mother.create({
    full_name: 'Ada Lovelace',
    email: 'ada.lovelace@example.com',
    password_hash: '$2b$10$samplehashedpassword',
    phone: '555-0122',
    address: '42 Babbage Way',
    zip_code: '94102',
    num_children: 1,
    children_ages: [1],
  });

  seededMotherId = mother.mother_id;
  seededGroupId = group.group_id;
  logger.info('Pristine interactive seed records loaded successfully.');
}

// Start HTTP Server
async function startServer() {
  try {
    await seedInitialData();
    app.listen(PORT, () => {
      logger.info(`✨ Interactive UI web harness serving flawlessly at: http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to spin up control panel server:', { error: err.message });
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
