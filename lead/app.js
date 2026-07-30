/* ==========================================================
   NIMBUS CRM — APPLICATION LOGIC
   Pure vanilla JS. All data lives in memory only (see "DATA
   LAYER" below). Nothing here talks to a server — every array
   is a stand-in for a future database table, structured so the
   whole file can be lifted into a Laravel/React data layer
   later with minimal changes (see comments per section).
========================================================== */

/* ============================================================
   1. DATA LAYER  (equivalent to DB tables)
============================================================ */
let leads = [];        // Lead records
let activities = [];   // Global activity/audit log
let followUps = [];    // Follow-up schedule entries
let users = [];        // Salespersons / team members
let notes = [];        // Notes, keyed by leadId
let attachments = [];  // Temporary file metadata, keyed by leadId

const STATUSES = ['New', 'Contacted', 'Quotation Sent', 'Negotiation', 'Won', 'Lost'];
const SOURCES = ['Facebook', 'Website', 'Referral', 'Walk-in', 'Phone Call', 'Email Campaign', 'Trade Show'];
const PRIORITIES = ['Low', 'Medium', 'High'];

// App/session state (not "data" — just UI state)
const state = {
  currentView: 'dashboard',
  currentLeadId: null,   // lead currently open in the detail view
  editingLeadId: null,   // lead currently open in the Add/Edit modal (null = adding)
  currentUser: { name: 'Admin User', role: 'Administrator', initial: 'A' },
  pendingConfirm: null,  // callback stored while confirm modal is open
};

let idCounter = { lead: 1, note: 1, attachment: 1, followup: 1, activity: 1 };
const nextId = (type) => `${type.toUpperCase().slice(0,3)}-${String(idCounter[type]++).padStart(4, '0')}`;

/* ============================================================
   2. DEMO DATA GENERATION
============================================================ */
const DEMO_FIRST = ['John','Jane','Michael','Maria','Robert','Angela','Carlos','Grace','Daniel','Cristina','Paul','Ella','Mark','Bianca','Kevin','Rose','Anthony','Nicole','Steven','Camille'];
const DEMO_LAST = ['Doe','Smith','Cruz','Santos','Reyes','Bautista','Torres','Garcia','Lim','Tan','Villanueva','Mendoza','Aquino','Delacruz','Ramos','Fernandez','Navarro','Castillo','Ocampo','Salazar'];
const DEMO_COMPANIES = ['Acme Retail','BrightPath Logistics','Sunrise Realty','Coastal Foods Co.','Vertex Solutions','Nova Digital','Prime Builders','Greenfield Agri','Northstar Finance','Bluewave Media','Silverline Autos','Harborview Hotels','Crestline Manufacturing','Everline Apparel','Metro Health Group'];
const DEMO_SERVICES = ['Website Development','POS System','Digital Marketing Package','Fleet Management Software','ERP Implementation','Branding & Design','Cloud Migration','Mobile App Development'];

function seedUsers() {
  users = [
    { id: 'U-01', name: 'Maria Santos', role: 'Senior Sales Executive', initial: 'M' },
    { id: 'U-02', name: 'Kevin Ramos', role: 'Sales Executive', initial: 'K' },
    { id: 'U-03', name: 'Angela Cruz', role: 'Sales Executive', initial: 'A' },
    { id: 'U-04', name: 'Daniel Torres', role: 'Account Manager', initial: 'D' },
    { id: 'U-05', name: 'Ella Bautista', role: 'Sales Executive', initial: 'E' },
  ];
}

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDateWithinDays(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d;
}
function formatDate(d) {
  const date = (d instanceof Date) ? d : new Date(d);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatDateTime(d) {
  const date = (d instanceof Date) ? d : new Date(d);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function timeAgo(d) {
  const date = (d instanceof Date) ? d : new Date(d);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function seedDemoData() {
  leads = []; activities = []; followUps = []; notes = []; attachments = [];
  idCounter = { lead: 1, note: 1, attachment: 1, followup: 1, activity: 1 };
  seedUsers();

  for (let i = 0; i < 20; i++) {
    const first = randomFrom(DEMO_FIRST);
    const last = randomFrom(DEMO_LAST);
    const name = `${first} ${last}`;
    const created = randomDateWithinDays(45);
    const salesperson = randomFrom(users);
    const status = randomFrom(STATUSES);
    const lead = {
      id: nextId('lead'),
      name,
      company: randomFrom(DEMO_COMPANIES),
      phone: `09${Math.floor(100000000 + Math.random()*899999999)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      facebook: `facebook.com/${first.toLowerCase()}${last.toLowerCase()}`,
      address: `${Math.floor(Math.random()*900)+1} ${randomFrom(['Rizal','Bonifacio','Mabini','Quezon','Aguinaldo'])} St., Metro City`,
      source: randomFrom(SOURCES),
      service: randomFrom(DEMO_SERVICES),
      budget: (Math.floor(Math.random()*480)+20) * 1000,
      priority: randomFrom(PRIORITIES),
      salesperson: salesperson.id,
      status,
      remarks: '',
      createdDate: created.toISOString(),
      statusHistory: [{ status, date: created.toISOString() }],
    };
    leads.push(lead);
    logActivity(lead.id, 'Lead Created', `${lead.name} was added as a new lead from ${lead.source}.`, created);

    // A note for roughly half the leads
    if (Math.random() > 0.5) {
      const noteDate = randomDateWithinDays(20);
      notes.push({
        id: nextId('note'), leadId: lead.id, author: salesperson.name,
        content: randomFrom([
          'Customer requested a follow-up call next week.',
          'Sent initial proposal, awaiting feedback.',
          'Very interested, budget confirmed.',
          'Asked for a discount, need approval.',
          'Left a voicemail, will try again tomorrow.',
        ]),
        date: noteDate.toISOString(),
      });
    }

    // Upcoming follow-up for some leads
    if (Math.random() > 0.55) {
      const fu = new Date();
      fu.setDate(fu.getDate() + Math.floor(Math.random() * 7) - 1);
      followUps.push({
        id: nextId('followup'), leadId: lead.id,
        date: fu.toISOString().slice(0, 10),
        time: `${String(Math.floor(Math.random()*8)+9).padStart(2,'0')}:00`,
        purpose: randomFrom(['Send revised quote','Product demo call','Contract signing','Check-in call','Discuss requirements']),
        salesperson: salesperson.id,
        reminder: true,
        done: false,
      });
      logActivity(lead.id, 'Follow-up Scheduled', `A follow-up was scheduled for ${lead.name}.`, randomDateWithinDays(5));
    }
  }
}

/* ============================================================
   3. ACTIVITY LOG
============================================================ */
function logActivity(leadId, action, message, date = new Date()) {
  activities.unshift({
    id: nextId('activity'),
    leadId,
    action,
    message,
    user: state.currentUser.name,
    date: (date instanceof Date ? date : new Date(date)).toISOString(),
  });
}

/* ============================================================
   4. LEAD CRUD FUNCTIONS
============================================================ */
function addLead(data) {
  const lead = {
    id: nextId('lead'),
    ...data,
    createdDate: new Date().toISOString(),
    statusHistory: [{ status: data.status, date: new Date().toISOString() }],
  };
  leads.unshift(lead);
  logActivity(lead.id, 'Lead Created', `${lead.name} was added as a new lead.`);
  return lead;
}

function editLead(id, data) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return null;
  const statusChanged = data.status && data.status !== lead.status;
  const spChanged = data.salesperson && data.salesperson !== lead.salesperson;
  Object.assign(lead, data);
  if (statusChanged) {
    lead.statusHistory.push({ status: data.status, date: new Date().toISOString() });
    logActivity(id, 'Status Changed', `Status changed to "${data.status}".`);
  }
  if (spChanged) {
    logActivity(id, 'Assigned to Salesperson', `Reassigned to ${getUserName(data.salesperson)}.`);
  }
  logActivity(id, 'Edited', `${lead.name}'s details were updated.`);
  return lead;
}

function deleteLead(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  leads = leads.filter(l => l.id !== id);
  notes = notes.filter(n => n.leadId !== id);
  attachments = attachments.filter(a => a.leadId !== id);
  followUps = followUps.filter(f => f.leadId !== id);
  logActivity(id, 'Deleted', `${lead.name} was deleted.`);
}

function movePipeline(leadId, newStatus) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead || lead.status === newStatus) return;
  lead.status = newStatus;
  lead.statusHistory.push({ status: newStatus, date: new Date().toISOString() });
  logActivity(leadId, 'Status Changed', `Status changed to "${newStatus}" via pipeline.`);
}

function getUserName(id) {
  const u = users.find(u => u.id === id);
  return u ? u.name : 'Unassigned';
}
function getUserInitial(id) {
  const u = users.find(u => u.id === id);
  return u ? u.initial : '?';
}

/* ============================================================
   5. NOTES / ATTACHMENTS / FOLLOW-UPS
============================================================ */
function addNote(leadId, content) {
  const note = { id: nextId('note'), leadId, author: state.currentUser.name, content, date: new Date().toISOString() };
  notes.unshift(note);
  logActivity(leadId, 'Note Added', `A note was added.`);
  return note;
}

function addAttachment(leadId, file) {
  const att = { id: nextId('attachment'), leadId, filename: file.name, size: file.size };
  attachments.unshift(att);
  logActivity(leadId, 'Attachment Added', `File "${file.name}" was attached.`);
  return att;
}

function removeAttachment(id) {
  const att = attachments.find(a => a.id === id);
  attachments = attachments.filter(a => a.id !== id);
  if (att) logActivity(att.leadId, 'Attachment Removed', `File "${att.filename}" was removed.`);
}

function scheduleFollowup(leadId, data) {
  const fu = { id: nextId('followup'), leadId, done: false, ...data };
  followUps.unshift(fu);
  logActivity(leadId, 'Follow-up Scheduled', `Follow-up set for ${formatDate(data.date)} at ${data.time}.`);
  return fu;
}

/* ============================================================
   6. SEARCH & FILTER
============================================================ */
function searchLead(query) {
  if (!query) return leads;
  const q = query.toLowerCase();
  return leads.filter(l =>
    l.name.toLowerCase().includes(q) ||
    (l.company || '').toLowerCase().includes(q) ||
    (l.phone || '').toLowerCase().includes(q) ||
    (l.email || '').toLowerCase().includes(q) ||
    l.status.toLowerCase().includes(q) ||
    getUserName(l.salesperson).toLowerCase().includes(q)
  );
}

function filterLead(list) {
  const status = document.getElementById('filterStatus').value;
  const source = document.getElementById('filterSource').value;
  const sp = document.getElementById('filterSalesperson').value;
  const priority = document.getElementById('filterPriority').value;
  const from = document.getElementById('filterDateFrom').value;
  const to = document.getElementById('filterDateTo').value;

  return list.filter(l => {
    if (status && l.status !== status) return false;
    if (source && l.source !== source) return false;
    if (sp && l.salesperson !== sp) return false;
    if (priority && l.priority !== priority) return false;
    if (from && new Date(l.createdDate) < new Date(from)) return false;
    if (to && new Date(l.createdDate) > new Date(to + 'T23:59:59')) return false;
    return true;
  });
}

function getVisibleLeads() {
  const query = document.getElementById('globalSearch').value.trim();
  return filterLead(searchLead(query));
}

/* ============================================================
   7. RENDER FUNCTIONS
============================================================ */
function statusBadgeClass(status) {
  return {
    'New': 'badge-new', 'Contacted': 'badge-contacted', 'Quotation Sent': 'badge-quotation',
    'Negotiation': 'badge-negotiation', 'Won': 'badge-won', 'Lost': 'badge-lost',
  }[status] || 'badge-new';
}
function priorityClass(p) {
  return { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' }[p] || 'priority-low';
}

function populateStaticSelects() {
  // Filter selects (leads view)
  fillSelect('filterStatus', STATUSES, 'All statuses');
  fillSelect('filterSource', SOURCES, 'All sources');
  fillSelect('filterPriority', PRIORITIES, 'All priorities');
  fillSelectFromUsers('filterSalesperson', 'All salespersons');
  // Modal selects
  fillSelectFromUsers('f_salesperson', null);
  fillSelectFromUsers('fu_salesperson', null);
}
function fillSelect(elId, values, placeholder) {
  const el = document.getElementById(elId);
  el.innerHTML = (placeholder ? `<option value="">${placeholder}</option>` : '') +
    values.map(v => `<option value="${v}">${v}</option>`).join('');
}
function fillSelectFromUsers(elId, placeholder) {
  const el = document.getElementById(elId);
  el.innerHTML = (placeholder ? `<option value="">${placeholder}</option>` : '') +
    users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
}

function updateDashboard() {
  const counts = { Total: leads.length };
  STATUSES.forEach(s => counts[s] = leads.filter(l => l.status === s).length);

  const cards = [
    { label: 'Total Leads', value: counts.Total, color: 'var(--primary)', bg: 'var(--primary-light)', icon: iconUsers() },
    { label: 'New Leads', value: counts['New'], color: 'var(--status-new)', bg: 'var(--primary-light)', icon: iconStar() },
    { label: 'Contacted', value: counts['Contacted'], color: 'var(--status-contacted)', bg: '#F5F3FF', icon: iconPhone() },
    { label: 'Quotation Sent', value: counts['Quotation Sent'], color: 'var(--status-quotation)', bg: 'var(--warning-bg)', icon: iconDoc() },
    { label: 'Negotiation', value: counts['Negotiation'], color: 'var(--status-negotiation)', bg: '#EFF9FF', icon: iconChat() },
    { label: 'Won', value: counts['Won'], color: 'var(--status-won)', bg: 'var(--success-bg)', icon: iconCheck() },
    { label: 'Lost', value: counts['Lost'], color: 'var(--status-lost)', bg: 'var(--danger-bg)', icon: iconX() },
  ];

  document.getElementById('statGrid').innerHTML = cards.map(c => `
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon" style="background:${c.bg}; color:${c.color}">${c.icon}</div>
      </div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
    </div>
  `).join('');

  // Recent activities (global, top 8)
  const recentEl = document.getElementById('recentActivities');
  const recent = activities.slice(0, 8);
  recentEl.innerHTML = recent.length ? recent.map(a => `
    <li>
      <span class="dot"></span>
      <div class="t-body">
        <div><strong>${a.action}</strong> — ${escapeHtml(a.message)}</div>
        <div class="t-time">${a.user} · ${timeAgo(a.date)}</div>
      </div>
    </li>
  `).join('') : '<li class="empty-row">No activity yet.</li>';

  // Upcoming follow-ups (today + future, sorted)
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = followUps
    .filter(f => !f.done && f.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 6);
  const fuEl = document.getElementById('upcomingFollowups');
  fuEl.innerHTML = upcoming.length ? upcoming.map(f => {
    const lead = leads.find(l => l.id === f.leadId);
    const isToday = f.date === today;
    return `<li>
      <span class="li-title">${lead ? escapeHtml(lead.name) : 'Unknown lead'} ${isToday ? '<span class="priority-pill priority-high">Today</span>' : ''}</span>
      <span class="li-sub">${formatDate(f.date)} at ${f.time} · ${escapeHtml(f.purpose || 'Follow-up')}</span>
    </li>`;
  }).join('') : '<li class="empty-row">No upcoming follow-ups.</li>';

  // Latest notes
  const notesEl = document.getElementById('latestNotes');
  const latest = notes.slice(0, 6);
  notesEl.innerHTML = latest.length ? latest.map(n => {
    const lead = leads.find(l => l.id === n.leadId);
    return `<li>
      <span class="li-title">${lead ? escapeHtml(lead.name) : 'Unknown lead'}</span>
      <span class="li-sub">${escapeHtml(truncate(n.content, 70))} — ${n.author}, ${timeAgo(n.date)}</span>
    </li>`;
  }).join('') : '<li class="empty-row">No notes yet.</li>';
}

function renderTable() {
  const visible = getVisibleLeads();
  const tbody = document.getElementById('leadsTableBody');
  const emptyState = document.getElementById('leadsEmptyState');

  if (!visible.length) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  tbody.innerHTML = visible.map(l => `
    <tr>
      <td class="cell-sub">${l.id}</td>
      <td>
        <div class="cell-name">${escapeHtml(l.name)}</div>
        <div class="cell-sub">${escapeHtml(l.email || '')}</div>
      </td>
      <td>${escapeHtml(l.company || '—')}</td>
      <td>${escapeHtml(l.phone || '—')}</td>
      <td>${escapeHtml(l.email || '—')}</td>
      <td>${escapeHtml(l.source)}</td>
      <td>${escapeHtml(getUserName(l.salesperson))}</td>
      <td><span class="badge ${statusBadgeClass(l.status)}">${l.status}</span></td>
      <td class="cell-sub">${formatDate(l.createdDate)}</td>
      <td>
        <div class="row-actions">
          <button class="btn btn-ghost btn-sm" data-action="view-lead" data-id="${l.id}">View</button>
          <button class="btn btn-ghost btn-sm" data-action="edit-lead" data-id="${l.id}">Edit</button>
          <button class="btn btn-danger btn-sm" data-action="delete-lead" data-id="${l.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderPipeline() {
  const board = document.getElementById('kanbanBoard');
  const visible = getVisibleLeads();
  board.innerHTML = STATUSES.map(status => {
    const colLeads = visible.filter(l => l.status === status);
    return `
    <div class="kanban-col" data-status="${status}">
      <div class="kanban-col-head">
        <span>${status}</span>
        <span class="count">${colLeads.length}</span>
      </div>
      <div class="kanban-cards" data-status="${status}">
        ${colLeads.map(l => `
          <div class="kanban-card" draggable="true" data-id="${l.id}">
            <div class="kc-name">${escapeHtml(l.name)}</div>
            <div class="kc-company">${escapeHtml(l.company || 'No company')}</div>
            <div class="kc-row">
              <span>${escapeHtml(l.phone || '')}</span>
              <span class="priority-pill ${priorityClass(l.priority)}">${l.priority}</span>
            </div>
            <div class="kc-row" style="margin-top:6px;">
              <span>${escapeHtml(getUserName(l.salesperson))}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }).join('');

  attachKanbanDragEvents();
}

function renderSalespersons() {
  const grid = document.getElementById('salespersonGrid');
  grid.innerHTML = users.map(u => {
    const spLeads = leads.filter(l => l.salesperson === u.id);
    const won = spLeads.filter(l => l.status === 'Won').length;
    const active = spLeads.filter(l => !['Won', 'Lost'].includes(l.status)).length;
    return `
    <div class="sp-card">
      <div class="sp-card-head">
        <div class="avatar">${u.initial}</div>
        <div><strong>${escapeHtml(u.name)}</strong><span>${escapeHtml(u.role)}</span></div>
      </div>
      <div class="sp-stats">
        <div class="sp-stat"><b>${spLeads.length}</b><span>Leads</span></div>
        <div class="sp-stat"><b>${active}</b><span>Active</span></div>
        <div class="sp-stat"><b>${won}</b><span>Won</span></div>
      </div>
    </div>`;
  }).join('');
}

function renderReports() {
  renderBarReport('reportByStatus', STATUSES.map(s => [s, leads.filter(l => l.status === s).length]));
  renderBarReport('reportBySource', SOURCES.map(s => [s, leads.filter(l => l.source === s).length]).filter(([,c]) => c > 0));
  renderBarReport('reportBySalesperson', users.map(u => [u.name, leads.filter(l => l.salesperson === u.id).length]));
}
function renderBarReport(elId, pairs) {
  const max = Math.max(1, ...pairs.map(p => p[1]));
  document.getElementById(elId).innerHTML = pairs.map(([label, count]) => `
    <div class="bar-row">
      <span class="bar-label" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${(count/max*100)}%"></span></span>
      <span class="bar-count">${count}</span>
    </div>
  `).join('') || '<p class="empty-row">No data.</p>';
}

function renderLeadDetail(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  state.currentLeadId = leadId;

  document.getElementById('detailAvatar').textContent = lead.name.charAt(0).toUpperCase();
  document.getElementById('detailName').textContent = lead.name;
  document.getElementById('detailCompany').textContent = lead.company || 'No company on file';
  const badge = document.getElementById('detailStatusBadge');
  badge.textContent = lead.status;
  badge.className = `badge ${statusBadgeClass(lead.status)}`;

  document.getElementById('detailInfoList').innerHTML = `
    <div><dt>Phone</dt><dd>${escapeHtml(lead.phone || '—')}</dd></div>
    <div><dt>Email</dt><dd>${escapeHtml(lead.email || '—')}</dd></div>
    <div><dt>Facebook</dt><dd>${escapeHtml(lead.facebook || '—')}</dd></div>
    <div><dt>Address</dt><dd>${escapeHtml(lead.address || '—')}</dd></div>
    <div><dt>Lead Source</dt><dd>${escapeHtml(lead.source)}</dd></div>
    <div><dt>Service Interested</dt><dd>${escapeHtml(lead.service || '—')}</dd></div>
    <div><dt>Budget</dt><dd>${lead.budget ? '₱' + Number(lead.budget).toLocaleString() : '—'}</dd></div>
    <div><dt>Priority</dt><dd><span class="priority-pill ${priorityClass(lead.priority)}">${lead.priority}</span></dd></div>
    <div><dt>Assigned Salesperson</dt><dd>${escapeHtml(getUserName(lead.salesperson))}</dd></div>
    <div><dt>Created</dt><dd>${formatDate(lead.createdDate)}</dd></div>
    <div style="grid-column:span 2"><dt>Remarks</dt><dd>${escapeHtml(lead.remarks || '—')}</dd></div>
  `;

  // Follow-ups
  const fus = followUps.filter(f => f.leadId === leadId).sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
  document.getElementById('detailFollowups').innerHTML = fus.length ? fus.map(f => `
    <li>
      <span class="li-title">${formatDate(f.date)} · ${f.time} ${f.done ? '<span class="priority-pill priority-low">Done</span>' : ''}</span>
      <span class="li-sub">${escapeHtml(f.purpose || 'Follow-up')} — ${escapeHtml(getUserName(f.salesperson))}</span>
    </li>
  `).join('') : '<li class="empty-row">No follow-ups scheduled.</li>';

  // Timeline
  const leadActivities = activities.filter(a => a.leadId === leadId);
  document.getElementById('detailTimeline').innerHTML = leadActivities.length ? leadActivities.map(a => `
    <li>
      <span class="dot"></span>
      <div class="t-body">
        <div><strong>${a.action}</strong> — ${escapeHtml(a.message)}</div>
        <div class="t-time">${a.user} · ${formatDateTime(a.date)}</div>
      </div>
    </li>
  `).join('') : '<li class="empty-row">No activity recorded.</li>';

  // Notes
  const leadNotes = notes.filter(n => n.leadId === leadId);
  document.getElementById('detailNotes').innerHTML = leadNotes.length ? leadNotes.map(n => `
    <li class="note-item">
      <div class="note-meta"><span>${escapeHtml(n.author)}</span><span>${formatDateTime(n.date)}</span></div>
      <div class="note-content">${escapeHtml(n.content)}</div>
    </li>
  `).join('') : '<li class="empty-row">No notes yet.</li>';

  // Attachments
  const leadAtts = attachments.filter(a => a.leadId === leadId);
  document.getElementById('detailAttachments').innerHTML = leadAtts.length ? leadAtts.map(a => `
    <li class="attachment-item">
      <span><span class="att-name">${escapeHtml(a.filename)}</span><span class="att-size">${formatBytes(a.size)}</span></span>
      <button data-action="remove-attachment" data-id="${a.id}">Remove</button>
    </li>
  `).join('') : '<li class="empty-row">No attachments.</li>';

  // Status history
  document.getElementById('detailStatusHistory').innerHTML = lead.statusHistory.slice().reverse().map(h => `
    <li><span class="li-title">${h.status}</span><span class="li-sub">${formatDateTime(h.date)}</span></li>
  `).join('');
}

function renderAll() {
  updateDashboard();
  renderTable();
  renderPipeline();
  renderSalespersons();
  renderReports();
  if (state.currentLeadId && leads.find(l => l.id === state.currentLeadId)) {
    renderLeadDetail(state.currentLeadId);
  }
}

/* ---------- small helpers ---------- */
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function truncate(str, n) { return str.length > n ? str.slice(0, n) + '…' : str; }
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1024/1024).toFixed(1) + ' MB';
}
function iconUsers(){return '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 1a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 8 12Zm8 2c-2.7 0-8 1.34-8 4v3h16v-3c0-2.66-5.3-4-8-4Z"/></svg>';}
function iconStar(){return '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M12 2l2.9 6.9L22 9.6l-5.5 4.9L18 22l-6-3.6L6 22l1.5-7.5L2 9.6l7.1-.7Z"/></svg>';}
function iconPhone(){return '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11 11 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .56 3.5 1 1 0 0 1-.25 1Z"/></svg>';}
function iconDoc(){return '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5Z"/></svg>';}
function iconChat(){return '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 3h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8l-4 4V4a1 1 0 0 1 1-1Z"/></svg>';}
function iconCheck(){return '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M9 16.2 4.8 12 3.4 13.4 9 19l12-12-1.4-1.4Z"/></svg>';}
function iconX(){return '<svg viewBox="0 0 24 24" width="17" height="17"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3Z"/></svg>';}

/* ============================================================
   8. NAVIGATION
============================================================ */
function switchView(viewName) {
  state.currentView = viewName;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item[data-view]').forEach(n => n.classList.remove('active'));

  const viewEl = document.getElementById(`view-${viewName}`);
  if (viewEl) viewEl.classList.add('active');
  const navEl = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if (navEl) navEl.classList.add('active');

  document.getElementById('sidebarEl')?.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

  if (viewName === 'dashboard') updateDashboard();
  if (viewName === 'leads') renderTable();
  if (viewName === 'pipeline') renderPipeline();
  if (viewName === 'salespersons') renderSalespersons();
  if (viewName === 'reports') renderReports();
}

function openLeadDetail(leadId) {
  renderLeadDetail(leadId);
  switchView('lead-detail');
}

/* ============================================================
   9. MODALS
============================================================ */
function openLeadModal(mode, leadId = null) {
  const form = document.getElementById('leadForm');
  form.reset();
  state.editingLeadId = leadId;
  document.getElementById('leadModalTitle').textContent = mode === 'edit' ? 'Edit Lead' : 'Add New Lead';

  if (mode === 'edit' && leadId) {
    const lead = leads.find(l => l.id === leadId);
    document.getElementById('leadIdInput').value = lead.id;
    document.getElementById('f_name').value = lead.name;
    document.getElementById('f_company').value = lead.company || '';
    document.getElementById('f_phone').value = lead.phone || '';
    document.getElementById('f_email').value = lead.email || '';
    document.getElementById('f_facebook').value = lead.facebook || '';
    document.getElementById('f_address').value = lead.address || '';
    document.getElementById('f_source').value = lead.source;
    document.getElementById('f_service').value = lead.service || '';
    document.getElementById('f_budget').value = lead.budget || '';
    document.getElementById('f_priority').value = lead.priority;
    document.getElementById('f_salesperson').value = lead.salesperson;
    document.getElementById('f_status').value = lead.status;
    document.getElementById('f_remarks').value = lead.remarks || '';
  } else {
    document.getElementById('leadIdInput').value = '';
    document.getElementById('f_status').value = 'New';
    document.getElementById('f_priority').value = 'Medium';
  }
  document.getElementById('leadModalOverlay').classList.remove('hidden');
}
function closeLeadModal() {
  document.getElementById('leadModalOverlay').classList.add('hidden');
  state.editingLeadId = null;
}

function openFollowupModal() {
  document.getElementById('followupForm').reset();
  document.getElementById('fu_date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('followupModalOverlay').classList.remove('hidden');
}
function closeFollowupModal() {
  document.getElementById('followupModalOverlay').classList.add('hidden');
}

function openConfirm(message, onConfirm) {
  document.getElementById('confirmMessage').textContent = message;
  state.pendingConfirm = onConfirm;
  document.getElementById('confirmOverlay').classList.remove('hidden');
}
function closeConfirm() {
  document.getElementById('confirmOverlay').classList.add('hidden');
  state.pendingConfirm = null;
}

function showToast(message, type = '') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ============================================================
   9b. THEME (light / dark)
============================================================ */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('nimbus-crm-theme', theme); } catch (err) { /* storage unavailable — theme just won't persist */ }
}
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('nimbus-crm-theme'); } catch (err) { /* ignore */ }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/* ============================================================
   10. EVENT WIRING
============================================================ */
function initEventListeners() {
  // Theme toggles (login screen + topbar mirror each other)
  document.getElementById('themeToggleLogin').addEventListener('click', toggleTheme);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Login
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim() || 'admin';
    state.currentUser = { name: toTitleCase(username), role: 'Administrator', initial: username.charAt(0).toUpperCase() };
    document.getElementById('currentUserName').textContent = state.currentUser.name;
    document.getElementById('currentUserAvatar').textContent = state.currentUser.initial;
    seedDemoData();
    populateStaticSelects();
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appShell').classList.remove('hidden');
    switchView('dashboard');
    renderAll();
  });

  // Sidebar navigation
  document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Mobile nav toggle
  document.getElementById('mobileNavToggle').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    openConfirm('Log out and erase all session data? This cannot be undone.', () => {
      leads = []; activities = []; followUps = []; users = []; notes = []; attachments = [];
      state.currentLeadId = null;
      document.getElementById('appShell').classList.add('hidden');
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('loginForm').reset();
      document.getElementById('loginUsername').value = 'admin';
      document.getElementById('loginPassword').value = 'demo1234';
    });
  });

  // Global search + filters
  document.getElementById('globalSearch').addEventListener('input', () => { renderTable(); renderPipeline(); });
  ['filterStatus','filterSource','filterSalesperson','filterPriority','filterDateFrom','filterDateTo'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => { renderTable(); renderPipeline(); });
  });
  document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    ['filterStatus','filterSource','filterSalesperson','filterPriority','filterDateFrom','filterDateTo'].forEach(id => document.getElementById(id).value = '');
    renderTable(); renderPipeline();
  });

  // Delegated clicks: add lead, view/edit/delete lead, back, etc.
  document.body.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    const id = actionEl.dataset.id;

    switch (action) {
      case 'open-add-lead': openLeadModal('add'); break;
      case 'close-lead-modal': closeLeadModal(); break;
      case 'view-lead': openLeadDetail(id); break;
      case 'edit-lead': openLeadModal('edit', id); break;
      case 'edit-current-lead': openLeadModal('edit', state.currentLeadId); break;
      case 'delete-lead':
        openConfirm('Delete this lead? This cannot be undone.', () => {
          deleteLead(id); renderAll(); showToast('Lead deleted', 'danger');
        });
        break;
      case 'delete-current-lead':
        openConfirm('Delete this lead? This cannot be undone.', () => {
          deleteLead(state.currentLeadId);
          state.currentLeadId = null;
          switchView('leads'); renderAll(); showToast('Lead deleted', 'danger');
        });
        break;
      case 'back-to-leads': switchView('leads'); break;
      case 'open-add-followup': openFollowupModal(); break;
      case 'close-followup-modal': closeFollowupModal(); break;
      case 'remove-attachment':
        removeAttachment(id);
        renderLeadDetail(state.currentLeadId);
        showToast('Attachment removed');
        break;
    }
  });

  // Close modals by clicking overlay background
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.classList.add('hidden'); });
  });

  // Confirm dialog buttons
  document.getElementById('confirmOkBtn').addEventListener('click', () => {
    if (typeof state.pendingConfirm === 'function') state.pendingConfirm();
    closeConfirm();
  });
  document.getElementById('confirmCancelBtn').addEventListener('click', closeConfirm);

  // Lead form submit (add or edit)
  document.getElementById('leadForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('f_name').value.trim(),
      company: document.getElementById('f_company').value.trim(),
      phone: document.getElementById('f_phone').value.trim(),
      email: document.getElementById('f_email').value.trim(),
      facebook: document.getElementById('f_facebook').value.trim(),
      address: document.getElementById('f_address').value.trim(),
      source: document.getElementById('f_source').value,
      service: document.getElementById('f_service').value.trim(),
      budget: Number(document.getElementById('f_budget').value) || 0,
      priority: document.getElementById('f_priority').value,
      salesperson: document.getElementById('f_salesperson').value,
      status: document.getElementById('f_status').value,
      remarks: document.getElementById('f_remarks').value.trim(),
    };
    const existingId = document.getElementById('leadIdInput').value;
    if (existingId) {
      editLead(existingId, data);
      showToast('Lead updated', 'success');
    } else {
      const lead = addLead(data);
      showToast('Lead added', 'success');
      state.currentLeadId = lead.id;
    }
    closeLeadModal();
    renderAll();
  });

  // Follow-up form submit
  document.getElementById('followupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.currentLeadId) return;
    scheduleFollowup(state.currentLeadId, {
      date: document.getElementById('fu_date').value,
      time: document.getElementById('fu_time').value,
      purpose: document.getElementById('fu_purpose').value.trim(),
      salesperson: document.getElementById('fu_salesperson').value,
      reminder: document.getElementById('fu_reminder').checked,
    });
    closeFollowupModal();
    renderLeadDetail(state.currentLeadId);
    updateDashboard();
    showToast('Follow-up scheduled', 'success');
  });

  // Add note form
  document.getElementById('addNoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const textarea = document.getElementById('newNoteContent');
    const content = textarea.value.trim();
    if (!content || !state.currentLeadId) return;
    addNote(state.currentLeadId, content);
    textarea.value = '';
    renderLeadDetail(state.currentLeadId);
    updateDashboard();
    showToast('Note added', 'success');
  });

  // Attachments
  document.getElementById('attachmentInput').addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !state.currentLeadId) return;
    files.forEach(f => addAttachment(state.currentLeadId, f));
    e.target.value = '';
    renderLeadDetail(state.currentLeadId);
    showToast(`${files.length} file${files.length > 1 ? 's' : ''} attached`, 'success');
  });

  // Reset demo data (settings)
  document.getElementById('resetDataBtn').addEventListener('click', () => {
    openConfirm('Reset all demo data back to the original 20 sample leads?', () => {
      seedDemoData();
      populateStaticSelects();
      renderAll();
      showToast('Demo data reset', 'success');
    });
  });
}

function toTitleCase(str) {
  return str.replace(/[._-]+/g, ' ').replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

/* ============================================================
   11. DRAG & DROP (Pipeline / Kanban)
============================================================ */
function attachKanbanDragEvents() {
  document.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', card.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });

  document.querySelectorAll('.kanban-col').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const leadId = e.dataTransfer.getData('text/plain');
      const newStatus = col.dataset.status;
      if (leadId && newStatus) {
        movePipeline(leadId, newStatus);
        renderAll();
        showToast(`Moved to ${newStatus}`);
      }
    });
  });
}

/* ============================================================
   12. INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  document.querySelector('.sidebar').id = 'sidebarEl';
  populateStaticSelects();
  initEventListeners();
});
