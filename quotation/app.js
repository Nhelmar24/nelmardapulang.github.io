/* ============================================================
   N24SS QUOTATION GENERATOR — APPLICATION LOGIC
   Frontend-only. All data lives in memory for the current
   session and is wiped completely on logout.
   ============================================================ */

/* ------------------------------------------------------------
   ICON SET (inline SVG, stroke uses currentColor)
------------------------------------------------------------ */
const N24SSIcons = {
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  'file-plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 12v6M9 15h6"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  quote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};

function N24SSRenderIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.getAttribute('data-icon');
    if (N24SSIcons[name] && el.innerHTML.trim() === '') {
      el.innerHTML = N24SSIcons[name];
    }
  });
}

/* ------------------------------------------------------------
   IN-MEMORY DATA STORE (never persisted)
------------------------------------------------------------ */
let N24SSCustomers = [];
let N24SSQuotations = [];
let N24SSItems = [];
let N24SSCompanyProfile = {};
let N24SSActivities = [];
let N24SSQuotationCounter = 0;

/* Working state for the quotation being built in the form */
let N24SSCurrentQuoteItems = [];
let N24SSEditingQuotationId = null;

/* Misc UI state */
let N24SSTheme = 'light';
let N24SSPendingConfirm = null;

/* ------------------------------------------------------------
   UTILITIES
------------------------------------------------------------ */
function N24SSUid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

function N24SSFormatMoney(n) {
  const v = isNaN(n) ? 0 : n;
  return '₱' + v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function N24SSFormatDate(d) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function N24SSFormatDateTime(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function N24SSToday() {
  return new Date().toISOString().slice(0, 10);
}

function N24SSEscapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function N24SSToast(message, type = 'default') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s';
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

/* ------------------------------------------------------------
   ACTIVITY LOG
------------------------------------------------------------ */
function N24SSLogActivity(text) {
  N24SSActivities.unshift({ id: N24SSUid('act'), text, time: new Date() });
  if (N24SSActivities.length > 50) N24SSActivities.pop();
  N24SSRenderActivities();
  N24SSRenderDashboard();
}

/* ------------------------------------------------------------
   LOGIN / LOGOUT
------------------------------------------------------------ */
function N24SSLogin(e) {
  if (e) e.preventDefault();
  N24SSSeedDemoData();
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');
  N24SSRenderIcons();
  N24SSRenderAll();
  N24SSToast('Welcome back, Admin!', 'success');
}

function N24SSLogout() {
  // Reset all in-memory state — nothing survives logout
  N24SSCustomers = [];
  N24SSQuotations = [];
  N24SSItems = [];
  N24SSCompanyProfile = {};
  N24SSActivities = [];
  N24SSQuotationCounter = 0;
  N24SSCurrentQuoteItems = [];
  N24SSEditingQuotationId = null;

  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginForm').reset();
  document.getElementById('loginUsername').value = 'admin';
  document.getElementById('loginPassword').value = 'admin123';
  N24SSToast('You have been logged out. Session data cleared.', 'default');
}

/* ------------------------------------------------------------
   THEME
------------------------------------------------------------ */
function N24SSToggleTheme() {
  N24SSTheme = N24SSTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', N24SSTheme);
  const icon = document.getElementById('themeIcon');
  icon.innerHTML = '';
  icon.setAttribute('data-icon', N24SSTheme === 'light' ? 'sun' : 'moon');
  N24SSRenderIcons();
}

/* ------------------------------------------------------------
   NAVIGATION
------------------------------------------------------------ */
function N24SSShowView(viewName) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + viewName);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
  });

  // Close mobile sidebar after navigating
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('show');

  document.getElementById('content').scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------------------------------------------------
   DEMO DATA SEEDING
------------------------------------------------------------ */
function N24SSSeedDemoData() {
  N24SSCompanyProfile = {
    name: 'N24SS Solutions Inc.',
    address: '123 Business Ave, Makati City, Metro Manila',
    phone: '+63 917 123 4567',
    email: 'info@n24ss.com',
    website: 'www.n24ss.com',
    tax: '000-123-456-789',
    authorized: 'Juan Dela Cruz',
    position: 'General Manager',
    logo: null,
  };

  N24SSCustomers = [
    { id: N24SSUid('cust'), name: 'John Doe', company: 'Doe Enterprises', contact: 'John Doe', phone: '+63 918 111 2222', email: 'john@doeenterprises.com', address: 'Quezon City, Metro Manila', tax: '111-222-333' },
    { id: N24SSUid('cust'), name: 'Jane Smith', company: 'Smith Retail Group', contact: 'Jane Smith', phone: '+63 917 222 3333', email: 'jane@smithretail.com', address: 'Pasig City, Metro Manila', tax: '222-333-444' },
    { id: N24SSUid('cust'), name: 'Michael Cruz', company: 'Cruz Logistics', contact: 'Michael Cruz', phone: '+63 916 333 4444', email: 'michael@cruzlogistics.com', address: 'Taguig City, Metro Manila', tax: '333-444-555' },
    { id: N24SSUid('cust'), name: 'Maria Santos', company: 'Santos Realty', contact: 'Maria Santos', phone: '+63 915 444 5555', email: 'maria@santosrealty.com', address: 'Manila City, Metro Manila', tax: '444-555-666' },
  ];

  N24SSItems = [
    { id: N24SSUid('itm'), name: 'Aircon Installation', description: 'Standard split-type aircon installation', qty: 1, unit: 'unit', price: 3500 },
    { id: N24SSUid('itm'), name: 'Aircon Cleaning', description: 'Deep cleaning service, indoor & outdoor unit', qty: 1, unit: 'unit', price: 800 },
    { id: N24SSUid('itm'), name: 'Preventive Maintenance', description: 'Quarterly preventive maintenance package', qty: 1, unit: 'visit', price: 1200 },
    { id: N24SSUid('itm'), name: 'Electrical Service', description: 'General electrical troubleshooting & repair', qty: 1, unit: 'hr', price: 650 },
  ];

  N24SSActivities = [];
  N24SSQuotationCounter = 123;

  const sampleCustomer = N24SSCustomers[0];
  const sampleItems = [
    { id: N24SSUid('qi'), name: 'Aircon Installation', description: 'Standard split-type aircon installation', qty: 2, unit: 'unit', price: 3500 },
    { id: N24SSUid('qi'), name: 'Preventive Maintenance', description: 'Quarterly preventive maintenance package', qty: 1, unit: 'visit', price: 1200 },
  ];
  const subtotal = sampleItems.reduce((s, it) => s + it.qty * it.price, 0);
  N24SSQuotations = [{
    id: N24SSUid('quo'),
    number: 'Quotation #000123',
    customerId: sampleCustomer.id,
    date: N24SSToday(),
    validUntil: N24SSToday(),
    preparedBy: 'Admin',
    status: 'Sent',
    items: sampleItems,
    discountType: 'percent',
    discountValue: 5,
    taxPercent: 12,
    notes: 'Please confirm schedule at least 2 days before installation.',
    terms: N24SSDefaultTerms(),
    subtotal,
    discount: subtotal * 0.05,
    tax: (subtotal - subtotal * 0.05) * 0.12,
    grandTotal: (subtotal - subtotal * 0.05) * 1.12,
    createdAt: new Date(),
  }];

  N24SSLogActivity('Quotation Created — Quotation #000123');
  N24SSLogActivity('Customer Added — John Doe');
  N24SSLogActivity('Customer Added — Jane Smith');
  N24SSLogActivity('Item Added — Aircon Installation');
}

function N24SSDefaultTerms() {
  return 'Payment Terms: 50% down payment, 50% upon completion.\nWarranty: 6 months on parts and labor.\nDelivery Schedule: 3-5 business days upon confirmation.\nQuotation Validity: This quotation is valid for 30 days from the date of issue.';
}

/* ------------------------------------------------------------
   QUOTATION NUMBERING
------------------------------------------------------------ */
function N24SSGenerateQuotationNumber() {
  N24SSQuotationCounter += 1;
  return 'Quotation #' + String(N24SSQuotationCounter).padStart(6, '0');
}

/* ------------------------------------------------------------
   DASHBOARD
------------------------------------------------------------ */
function N24SSRenderDashboard() {
  const total = N24SSQuotations.length;
  const draft = N24SSQuotations.filter(q => q.status === 'Draft').length;
  const pending = N24SSQuotations.filter(q => q.status === 'Sent').length;
  const approved = N24SSQuotations.filter(q => q.status === 'Approved').length;
  const rejected = N24SSQuotations.filter(q => q.status === 'Rejected').length;
  const customers = N24SSCustomers.length;

  const stats = [
    { label: 'Total Quotations', value: total, icon: 'quote', color: 'blue' },
    { label: 'Draft Quotations', value: draft, icon: 'edit', color: 'gray' },
    { label: 'Pending Quotations', value: pending, icon: 'clock', color: 'amber' },
    { label: 'Approved Quotations', value: approved, icon: 'check', color: 'green' },
    { label: 'Rejected Quotations', value: rejected, icon: 'x', color: 'red' },
    { label: 'Total Customers', value: customers, icon: 'users', color: 'purple' },
  ];

  const grid = document.getElementById('statGrid');
  grid.innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="stat-icon ${s.color}"><span class="nav-icon">${N24SSIcons[s.icon]}</span></div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');

  // Recent quotations (top 5, newest first)
  const recentBody = document.querySelector('#recentQuotationsTable tbody');
  const recent = [...N24SSQuotations].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  recentBody.innerHTML = recent.length ? recent.map(q => {
    const cust = N24SSCustomers.find(c => c.id === q.customerId);
    return `<tr>
      <td>${q.number}</td>
      <td>${N24SSEscapeHtml(cust ? cust.name : '—')}</td>
      <td>${N24SSFormatDate(q.date)}</td>
      <td>${N24SSStatusBadge(q.status)}</td>
      <td>${N24SSFormatMoney(q.grandTotal)}</td>
    </tr>`;
  }).join('') : `<tr><td colspan="5" class="empty-row">No quotations yet</td></tr>`;

  // Upcoming follow-ups: quotations with status Sent, sorted by validUntil
  const followups = [...N24SSQuotations]
    .filter(q => q.status === 'Sent')
    .sort((a, b) => new Date(a.validUntil) - new Date(b.validUntil))
    .slice(0, 5);
  const followupList = document.getElementById('followupList');
  followupList.innerHTML = followups.length ? followups.map(q => {
    const cust = N24SSCustomers.find(c => c.id === q.customerId);
    return `<li class="followup-item">
      <strong>${q.number} — ${N24SSEscapeHtml(cust ? cust.name : '—')}</strong>
      <p>Valid until ${N24SSFormatDate(q.validUntil)}</p>
    </li>`;
  }).join('') : `<li class="empty-row">No pending follow-ups</li>`;

  N24SSRenderIcons(grid);
}

function N24SSStatusBadge(status) {
  const cls = {
    Draft: 'badge-draft',
    Sent: 'badge-sent',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected',
  }[status] || 'badge-draft';
  return `<span class="badge ${cls}">${status}</span>`;
}

function N24SSRenderActivities() {
  const list = document.getElementById('activityList');
  if (!N24SSActivities.length) {
    list.innerHTML = `<li class="empty-row">No activity yet</li>`;
    return;
  }
  list.innerHTML = N24SSActivities.slice(0, 12).map(a => `
    <li>
      <span class="activity-dot"></span>
      <div>
        <div class="activity-text">${N24SSEscapeHtml(a.text)}</div>
        <div class="activity-time">${N24SSFormatDateTime(a.time)}</div>
      </div>
    </li>
  `).join('');
}

/* ------------------------------------------------------------
   CUSTOMER MANAGEMENT
------------------------------------------------------------ */
function N24SSRenderCustomers(filter = '') {
  const tbody = document.querySelector('#customersTable tbody');
  const f = filter.trim().toLowerCase();
  const rows = N24SSCustomers.filter(c =>
    !f || [c.name, c.company, c.contact, c.phone, c.email].some(v => (v || '').toLowerCase().includes(f))
  );
  tbody.innerHTML = rows.length ? rows.map(c => `
    <tr>
      <td>${N24SSEscapeHtml(c.name)}</td>
      <td>${N24SSEscapeHtml(c.company)}</td>
      <td>${N24SSEscapeHtml(c.contact)}</td>
      <td>${N24SSEscapeHtml(c.phone)}</td>
      <td>${N24SSEscapeHtml(c.email)}</td>
      <td>${N24SSEscapeHtml(c.tax)}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" data-edit-customer="${c.id}" title="Edit"><span class="nav-icon" data-icon="edit"></span></button>
          <button class="icon-btn" data-delete-customer="${c.id}" title="Delete"><span class="nav-icon" data-icon="trash"></span></button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="7" class="empty-row">No customers found</td></tr>`;
  N24SSRenderIcons(tbody);
}

function N24SSOpenCustomerModal(id = null) {
  const modal = document.getElementById('customerModal');
  document.getElementById('customerId').value = id || '';
  if (id) {
    const c = N24SSCustomers.find(x => x.id === id);
    document.getElementById('customerModalTitle').textContent = 'Edit Customer';
    document.getElementById('custName').value = c.name;
    document.getElementById('custCompany').value = c.company;
    document.getElementById('custContact').value = c.contact;
    document.getElementById('custPhone').value = c.phone;
    document.getElementById('custEmail').value = c.email;
    document.getElementById('custAddress').value = c.address;
    document.getElementById('custTax').value = c.tax;
  } else {
    document.getElementById('customerModalTitle').textContent = 'Add Customer';
    ['custName','custCompany','custContact','custPhone','custEmail','custAddress','custTax'].forEach(id2 => document.getElementById(id2).value = '');
  }
  N24SSOpenModal('customerModal');
}

function N24SSCreateCustomer() {
  const id = document.getElementById('customerId').value;
  const data = {
    name: document.getElementById('custName').value.trim(),
    company: document.getElementById('custCompany').value.trim(),
    contact: document.getElementById('custContact').value.trim(),
    phone: document.getElementById('custPhone').value.trim(),
    email: document.getElementById('custEmail').value.trim(),
    address: document.getElementById('custAddress').value.trim(),
    tax: document.getElementById('custTax').value.trim(),
  };
  if (!data.name) { N24SSToast('Customer name is required', 'error'); return; }

  if (id) {
    N24SSUpdateCustomer(id, data);
  } else {
    N24SSCustomers.push({ id: N24SSUid('cust'), ...data });
    N24SSLogActivity('Customer Added — ' + data.name);
    N24SSToast('Customer added', 'success');
  }
  N24SSCloseModal('customerModal');
  N24SSRenderCustomers(document.getElementById('customerSearch').value);
  N24SSRefreshCustomerDropdown();
  N24SSRenderDashboard();
}

function N24SSUpdateCustomer(id, data) {
  const idx = N24SSCustomers.findIndex(c => c.id === id);
  if (idx === -1) return;
  N24SSCustomers[idx] = { ...N24SSCustomers[idx], ...data };
  N24SSLogActivity('Quotation Updated — Customer ' + data.name + ' updated');
  N24SSToast('Customer updated', 'success');
}

function N24SSDeleteCustomer(id) {
  const c = N24SSCustomers.find(x => x.id === id);
  N24SSCustomers = N24SSCustomers.filter(x => x.id !== id);
  N24SSRenderCustomers(document.getElementById('customerSearch').value);
  N24SSRefreshCustomerDropdown();
  N24SSRenderDashboard();
  if (c) N24SSToast('Customer deleted', 'warning');
}

function N24SSRefreshCustomerDropdown() {
  const sel = document.getElementById('qCustomer');
  const current = sel.value;
  sel.innerHTML = N24SSCustomers.map(c => `<option value="${c.id}">${N24SSEscapeHtml(c.name)} — ${N24SSEscapeHtml(c.company)}</option>`).join('');
  if (current && N24SSCustomers.some(c => c.id === current)) sel.value = current;
}

/* ------------------------------------------------------------
   COMPANY PROFILE
------------------------------------------------------------ */
function N24SSRenderCompanyProfile() {
  const c = N24SSCompanyProfile;
  document.getElementById('cName').value = c.name || '';
  document.getElementById('cAddress').value = c.address || '';
  document.getElementById('cPhone').value = c.phone || '';
  document.getElementById('cEmail').value = c.email || '';
  document.getElementById('cWebsite').value = c.website || '';
  document.getElementById('cTax').value = c.tax || '';
  document.getElementById('cAuthorized').value = c.authorized || '';
  document.getElementById('cPosition').value = c.position || '';

  const preview = document.getElementById('logoPreview');
  const placeholder = document.getElementById('logoPlaceholder');
  if (c.logo) {
    preview.src = c.logo;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }
}

function N24SSSaveCompanyProfile() {
  N24SSCompanyProfile = {
    ...N24SSCompanyProfile,
    name: document.getElementById('cName').value.trim(),
    address: document.getElementById('cAddress').value.trim(),
    phone: document.getElementById('cPhone').value.trim(),
    email: document.getElementById('cEmail').value.trim(),
    website: document.getElementById('cWebsite').value.trim(),
    tax: document.getElementById('cTax').value.trim(),
    authorized: document.getElementById('cAuthorized').value.trim(),
    position: document.getElementById('cPosition').value.trim(),
  };
  N24SSLogActivity('Company Profile Updated');
  N24SSToast('Company profile saved', 'success');
}

function N24SSHandleLogoUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    N24SSCompanyProfile.logo = e.target.result; // temporary in-memory data URL only
    N24SSRenderCompanyProfile();
    N24SSToast('Logo uploaded', 'success');
  };
  reader.readAsDataURL(file);
}

/* ------------------------------------------------------------
   ITEM MANAGEMENT
------------------------------------------------------------ */
function N24SSRenderItems() {
  const tbody = document.querySelector('#itemsTable tbody');
  tbody.innerHTML = N24SSItems.length ? N24SSItems.map(it => `
    <tr>
      <td>${N24SSEscapeHtml(it.name)}</td>
      <td>${N24SSEscapeHtml(it.description)}</td>
      <td>${it.qty}</td>
      <td>${N24SSEscapeHtml(it.unit)}</td>
      <td>${N24SSFormatMoney(it.price)}</td>
      <td>${N24SSFormatMoney(it.qty * it.price)}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" data-edit-item="${it.id}" title="Edit"><span class="nav-icon" data-icon="edit"></span></button>
          <button class="icon-btn" data-delete-item="${it.id}" title="Delete"><span class="nav-icon" data-icon="trash"></span></button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="7" class="empty-row">No items yet</td></tr>`;
  N24SSRenderIcons(tbody);
  N24SSRefreshItemCatalog();
}

function N24SSOpenItemModal(id = null) {
  document.getElementById('itemId').value = id || '';
  if (id) {
    const it = N24SSItems.find(x => x.id === id);
    document.getElementById('itemModalTitle').textContent = 'Edit Item';
    document.getElementById('itmName').value = it.name;
    document.getElementById('itmDesc').value = it.description;
    document.getElementById('itmQty').value = it.qty;
    document.getElementById('itmUnit').value = it.unit;
    document.getElementById('itmPrice').value = it.price;
  } else {
    document.getElementById('itemModalTitle').textContent = 'Add Item';
    document.getElementById('itmName').value = '';
    document.getElementById('itmDesc').value = '';
    document.getElementById('itmQty').value = 1;
    document.getElementById('itmUnit').value = 'pc';
    document.getElementById('itmPrice').value = 0;
  }
  N24SSOpenModal('itemModal');
}

function N24SSAddItem() {
  const id = document.getElementById('itemId').value;
  const data = {
    name: document.getElementById('itmName').value.trim(),
    description: document.getElementById('itmDesc').value.trim(),
    qty: parseFloat(document.getElementById('itmQty').value) || 0,
    unit: document.getElementById('itmUnit').value.trim() || 'pc',
    price: parseFloat(document.getElementById('itmPrice').value) || 0,
  };
  if (!data.name) { N24SSToast('Item name is required', 'error'); return; }

  if (id) {
    const idx = N24SSItems.findIndex(x => x.id === id);
    N24SSItems[idx] = { ...N24SSItems[idx], ...data };
    N24SSToast('Item updated', 'success');
  } else {
    N24SSItems.push({ id: N24SSUid('itm'), ...data });
    N24SSLogActivity('Item Added — ' + data.name);
    N24SSToast('Item added', 'success');
  }
  N24SSCloseModal('itemModal');
  N24SSRenderItems();
}

function N24SSDeleteItem(id) {
  N24SSItems = N24SSItems.filter(x => x.id !== id);
  N24SSRenderItems();
  N24SSToast('Item deleted', 'warning');
}

function N24SSRefreshItemCatalog() {
  const sel = document.getElementById('qItemCatalog');
  sel.innerHTML = '<option value="">-- Custom item --</option>' +
    N24SSItems.map(it => `<option value="${it.id}">${N24SSEscapeHtml(it.name)}</option>`).join('');
}

/* ------------------------------------------------------------
   QUOTATION GENERATOR
------------------------------------------------------------ */
function N24SSResetQuotationForm() {
  N24SSEditingQuotationId = null;
  N24SSCurrentQuoteItems = [];
  document.getElementById('qNumber').value = N24SSGenerateQuotationNumber();
  document.getElementById('qDate').value = N24SSToday();
  document.getElementById('qValidUntil').value = N24SSToday();
  document.getElementById('qPreparedBy').value = 'Admin';
  document.getElementById('qStatus').value = 'Draft';
  document.getElementById('qDiscountType').value = 'percent';
  document.getElementById('qDiscountValue').value = 0;
  document.getElementById('qTaxPercent').value = 12;
  document.getElementById('qNotes').value = '';
  document.getElementById('qTerms').value = N24SSDefaultTerms();
  N24SSRefreshCustomerDropdown();
  N24SSRenderQuotationItems();
  N24SSCalculateTotals();
}

function N24SSRenderQuotationItems() {
  const tbody = document.getElementById('qItemsBody');
  tbody.innerHTML = N24SSCurrentQuoteItems.length ? N24SSCurrentQuoteItems.map(it => `
    <tr>
      <td>${N24SSEscapeHtml(it.name)}</td>
      <td>${N24SSEscapeHtml(it.description)}</td>
      <td>${it.qty}</td>
      <td>${N24SSEscapeHtml(it.unit)}</td>
      <td>${N24SSFormatMoney(it.price)}</td>
      <td>${N24SSFormatMoney(it.qty * it.price)}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" data-remove-qitem="${it.id}" title="Remove"><span class="nav-icon" data-icon="trash"></span></button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="7" class="empty-row">No items added yet</td></tr>`;
  N24SSRenderIcons(tbody);
  N24SSCalculateTotals();
}

function N24SSOpenQItemModal() {
  document.getElementById('qiName').value = '';
  document.getElementById('qiDesc').value = '';
  document.getElementById('qiQty').value = 1;
  document.getElementById('qiUnit').value = 'pc';
  document.getElementById('qiPrice').value = 0;
  document.getElementById('qItemCatalog').value = '';
  N24SSOpenModal('qItemModal');
}

function N24SSFillFromCatalog(itemId) {
  if (!itemId) return;
  const it = N24SSItems.find(x => x.id === itemId);
  if (!it) return;
  document.getElementById('qiName').value = it.name;
  document.getElementById('qiDesc').value = it.description;
  document.getElementById('qiQty').value = it.qty || 1;
  document.getElementById('qiUnit').value = it.unit;
  document.getElementById('qiPrice').value = it.price;
}

function N24SSSaveQItem() {
  const name = document.getElementById('qiName').value.trim();
  if (!name) { N24SSToast('Item name is required', 'error'); return; }
  N24SSCurrentQuoteItems.push({
    id: N24SSUid('qi'),
    name,
    description: document.getElementById('qiDesc').value.trim(),
    qty: parseFloat(document.getElementById('qiQty').value) || 0,
    unit: document.getElementById('qiUnit').value.trim() || 'pc',
    price: parseFloat(document.getElementById('qiPrice').value) || 0,
  });
  N24SSCloseModal('qItemModal');
  N24SSRenderQuotationItems();
}

function N24SSRemoveQItem(id) {
  N24SSCurrentQuoteItems = N24SSCurrentQuoteItems.filter(x => x.id !== id);
  N24SSRenderQuotationItems();
}

function N24SSCalculateTotals() {
  const subtotal = N24SSCurrentQuoteItems.reduce((s, it) => s + it.qty * it.price, 0);
  const discountType = document.getElementById('qDiscountType').value;
  const discountValue = parseFloat(document.getElementById('qDiscountValue').value) || 0;
  const taxPercent = parseFloat(document.getElementById('qTaxPercent').value) || 0;

  let discount = discountType === 'percent' ? subtotal * (discountValue / 100) : discountValue;
  discount = Math.min(discount, subtotal);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * (taxPercent / 100);
  const grandTotal = afterDiscount + tax;

  document.getElementById('totalSubtotal').textContent = N24SSFormatMoney(subtotal);
  document.getElementById('totalDiscount').textContent = '-' + N24SSFormatMoney(discount);
  document.getElementById('totalTax').textContent = N24SSFormatMoney(tax);
  document.getElementById('totalGrand').textContent = N24SSFormatMoney(grandTotal);

  return { subtotal, discount, tax, grandTotal };
}

function N24SSCreateQuotation() {
  if (!N24SSCurrentQuoteItems.length) { N24SSToast('Add at least one item', 'error'); return; }
  const customerId = document.getElementById('qCustomer').value;
  if (!customerId) { N24SSToast('Select a customer', 'error'); return; }

  const totals = N24SSCalculateTotals();
  const data = {
    number: document.getElementById('qNumber').value,
    customerId,
    date: document.getElementById('qDate').value,
    validUntil: document.getElementById('qValidUntil').value,
    preparedBy: document.getElementById('qPreparedBy').value.trim(),
    status: document.getElementById('qStatus').value,
    items: N24SSCurrentQuoteItems.map(it => ({ ...it })),
    discountType: document.getElementById('qDiscountType').value,
    discountValue: parseFloat(document.getElementById('qDiscountValue').value) || 0,
    taxPercent: parseFloat(document.getElementById('qTaxPercent').value) || 0,
    notes: document.getElementById('qNotes').value.trim(),
    terms: document.getElementById('qTerms').value.trim(),
    ...totals,
  };

  if (N24SSEditingQuotationId) {
    const idx = N24SSQuotations.findIndex(q => q.id === N24SSEditingQuotationId);
    N24SSQuotations[idx] = { ...N24SSQuotations[idx], ...data };
    N24SSLogActivity('Quotation Updated — ' + data.number);
    N24SSToast('Quotation updated', 'success');
  } else {
    N24SSQuotations.push({ id: N24SSUid('quo'), createdAt: new Date(), ...data });
    N24SSLogActivity('Quotation Created — ' + data.number);
    N24SSToast('Quotation saved', 'success');
  }

  N24SSRenderDashboard();
  N24SSResetQuotationForm();
}

function N24SSLoadQuotationIntoForm(id) {
  const q = N24SSQuotations.find(x => x.id === id);
  if (!q) return;
  N24SSEditingQuotationId = id;
  N24SSCurrentQuoteItems = q.items.map(it => ({ ...it }));
  document.getElementById('qNumber').value = q.number;
  N24SSRefreshCustomerDropdown();
  document.getElementById('qCustomer').value = q.customerId;
  document.getElementById('qDate').value = q.date;
  document.getElementById('qValidUntil').value = q.validUntil;
  document.getElementById('qPreparedBy').value = q.preparedBy;
  document.getElementById('qStatus').value = q.status;
  document.getElementById('qDiscountType').value = q.discountType;
  document.getElementById('qDiscountValue').value = q.discountValue;
  document.getElementById('qTaxPercent').value = q.taxPercent;
  document.getElementById('qNotes').value = q.notes;
  document.getElementById('qTerms').value = q.terms;
  N24SSRenderQuotationItems();
  N24SSShowView('quotation');
}

/* ------------------------------------------------------------
   QUOTATION PREVIEW / PDF
------------------------------------------------------------ */
function N24SSBuildQuoteDocHtml(q, customer) {
  const c = N24SSCompanyProfile;
  const itemsRows = q.items.map(it => `
    <tr>
      <td>${N24SSEscapeHtml(it.name)}<br><span style="color:#94A3B8;font-size:11px;">${N24SSEscapeHtml(it.description || '')}</span></td>
      <td class="num">${it.qty}</td>
      <td>${N24SSEscapeHtml(it.unit)}</td>
      <td class="num">${N24SSFormatMoney(it.price)}</td>
      <td class="num">${N24SSFormatMoney(it.qty * it.price)}</td>
    </tr>
  `).join('');

  return `
    <div class="quote-doc-header">
      <div style="display:flex; gap:14px; align-items:center;">
        ${c.logo ? `<img class="quote-doc-logo" src="${c.logo}" alt="Logo">` : ''}
        <div class="quote-doc-company">
          <h2>${N24SSEscapeHtml(c.name || 'N24SS Quotation Generator')}</h2>
          <p>${N24SSEscapeHtml(c.address || '')}</p>
          <p>${N24SSEscapeHtml(c.phone || '')} ${c.email ? '· ' + N24SSEscapeHtml(c.email) : ''}</p>
          <p>${c.website ? N24SSEscapeHtml(c.website) : ''} ${c.tax ? '· TIN: ' + N24SSEscapeHtml(c.tax) : ''}</p>
        </div>
      </div>
      <div class="quote-doc-title">
        <h1>QUOTATION</h1>
        <p>${N24SSEscapeHtml(q.number)}</p>
      </div>
    </div>

    <div class="quote-doc-meta">
      <div>
        <h4>Bill To</h4>
        <p><strong>${N24SSEscapeHtml(customer ? customer.name : '—')}</strong></p>
        <p>${N24SSEscapeHtml(customer ? customer.company : '')}</p>
        <p>${N24SSEscapeHtml(customer ? customer.address : '')}</p>
        <p>${N24SSEscapeHtml(customer ? customer.phone : '')} ${customer && customer.email ? '· ' + N24SSEscapeHtml(customer.email) : ''}</p>
      </div>
      <div>
        <h4>Quotation Info</h4>
        <p>Date: ${N24SSFormatDate(q.date)}</p>
        <p>Valid Until: ${N24SSFormatDate(q.validUntil)}</p>
        <p>Prepared By: ${N24SSEscapeHtml(q.preparedBy)}</p>
        <p>Status: ${q.status}</p>
      </div>
    </div>

    <table class="quote-doc-table">
      <thead>
        <tr><th>Item</th><th class="num">Qty</th><th>Unit</th><th class="num">Unit Price</th><th class="num">Amount</th></tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <div class="quote-doc-totals">
      <table>
        <tr><td>Subtotal</td><td>${N24SSFormatMoney(q.subtotal)}</td></tr>
        <tr><td>Discount</td><td>-${N24SSFormatMoney(q.discount)}</td></tr>
        <tr><td>Tax (${q.taxPercent}%)</td><td>${N24SSFormatMoney(q.tax)}</td></tr>
        <tr class="grand"><td>Grand Total</td><td>${N24SSFormatMoney(q.grandTotal)}</td></tr>
      </table>
    </div>

    ${q.notes ? `<div class="quote-doc-section"><h4>Notes</h4><p>${N24SSEscapeHtml(q.notes)}</p></div>` : ''}
    ${q.terms ? `<div class="quote-doc-section"><h4>Terms &amp; Conditions</h4><p>${N24SSEscapeHtml(q.terms)}</p></div>` : ''}

    <div class="quote-doc-sign">
      <div class="sign-box">
        <div class="sign-line">${N24SSEscapeHtml(customer ? customer.name : 'Customer')}</div>
        <div class="sign-role">Customer Signature</div>
      </div>
      <div class="sign-box">
        <div class="sign-line">${N24SSEscapeHtml(c.authorized || 'Authorized Signatory')}</div>
        <div class="sign-role">${N24SSEscapeHtml(c.position || 'Authorized Representative')}</div>
      </div>
    </div>
  `;
}

function N24SSPreviewQuotation() {
  if (!N24SSCurrentQuoteItems.length) { N24SSToast('Add at least one item to preview', 'error'); return; }
  const customerId = document.getElementById('qCustomer').value;
  const customer = N24SSCustomers.find(c => c.id === customerId);
  const totals = N24SSCalculateTotals();

  const q = {
    number: document.getElementById('qNumber').value,
    date: document.getElementById('qDate').value,
    validUntil: document.getElementById('qValidUntil').value,
    preparedBy: document.getElementById('qPreparedBy').value,
    status: document.getElementById('qStatus').value,
    items: N24SSCurrentQuoteItems,
    taxPercent: parseFloat(document.getElementById('qTaxPercent').value) || 0,
    notes: document.getElementById('qNotes').value,
    terms: document.getElementById('qTerms').value,
    ...totals,
  };

  document.getElementById('quotationPreviewDoc').innerHTML = N24SSBuildQuoteDocHtml(q, customer);
  N24SSOpenModal('previewModal');
}

function N24SSPreviewSavedQuotation(id) {
  const q = N24SSQuotations.find(x => x.id === id);
  if (!q) return;
  const customer = N24SSCustomers.find(c => c.id === q.customerId);
  document.getElementById('quotationPreviewDoc').innerHTML = N24SSBuildQuoteDocHtml(q, customer);
  N24SSOpenModal('previewModal');
}

function N24SSExportPDF() {
  const doc = document.getElementById('quotationPreviewDoc');
  if (!doc || !doc.innerHTML.trim()) { N24SSToast('Nothing to export', 'error'); return; }
  if (!window.html2canvas || !window.jspdf) { N24SSToast('PDF library unavailable — check your connection', 'error'); return; }

  N24SSToast('Generating PDF...', 'default');
  window.html2canvas(doc, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/png');
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = 'N24SS-' + (document.getElementById('qNumber').value || 'Quotation').replace(/[^a-zA-Z0-9]/g, '-') + '.pdf';
    pdf.save(filename);
    N24SSLogActivity('PDF Generated — ' + (document.getElementById('qNumber').value || ''));
    N24SSToast('PDF exported', 'success');
  }).catch(() => {
    N24SSToast('PDF export failed', 'error');
  });
}

/* ------------------------------------------------------------
   SEARCH
------------------------------------------------------------ */
function N24SSSearchQuotation(term) {
  const t = term.trim().toLowerCase();
  if (!t) return N24SSShowView('dashboard');

  const results = N24SSQuotations.filter(q => {
    const cust = N24SSCustomers.find(c => c.id === q.customerId) || {};
    return [q.number, cust.name, cust.company, cust.phone, cust.email]
      .some(v => (v || '').toLowerCase().includes(t));
  });

  document.getElementById('searchResultsSub').textContent = `${results.length} result(s) for "${term}"`;
  const body = document.getElementById('searchResultsBody');
  body.innerHTML = results.length ? results.map(q => {
    const cust = N24SSCustomers.find(c => c.id === q.customerId);
    return `<tr>
      <td>${q.number}</td>
      <td>${N24SSEscapeHtml(cust ? cust.name : '—')}</td>
      <td>${N24SSEscapeHtml(cust ? cust.company : '—')}</td>
      <td>${N24SSFormatDate(q.date)}</td>
      <td>${N24SSStatusBadge(q.status)}</td>
      <td>${N24SSFormatMoney(q.grandTotal)}</td>
      <td><button class="btn btn-sm btn-secondary" data-view-quote="${q.id}">View</button></td>
    </tr>`;
  }).join('') : `<tr><td colspan="7" class="empty-row">No matching quotations</td></tr>`;

  N24SSShowView('search');
}

/* ------------------------------------------------------------
   MODAL HELPERS
------------------------------------------------------------ */
function N24SSOpenModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function N24SSCloseModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function N24SSConfirm(title, message, onConfirm) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  N24SSPendingConfirm = onConfirm;
  N24SSOpenModal('confirmModal');
}

/* ------------------------------------------------------------
   MASTER RENDER
------------------------------------------------------------ */
function N24SSRenderAll() {
  N24SSRenderCompanyProfile();
  N24SSRenderCustomers();
  N24SSRenderItems();
  N24SSRefreshCustomerDropdown();
  N24SSResetQuotationForm();
  N24SSRenderDashboard();
  N24SSRenderActivities();
}

/* ------------------------------------------------------------
   EVENT WIRING
------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  N24SSRenderIcons();

  // Login
  document.getElementById('loginForm').addEventListener('submit', N24SSLogin);

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    N24SSConfirm('Log out?', 'This will clear all session data and cannot be undone.', N24SSLogout);
  });

  // Theme
  document.getElementById('themeToggle').addEventListener('click', N24SSToggleTheme);
  document.getElementById('settingsThemeBtn').addEventListener('click', N24SSToggleTheme);

  // Sidebar navigation
  document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => N24SSShowView(btn.getAttribute('data-view')));
  });
  document.querySelectorAll('[data-view-nav]').forEach(btn => {
    btn.addEventListener('click', () => N24SSShowView(btn.getAttribute('data-view-nav')));
  });

  // Mobile sidebar toggle
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarBackdrop').classList.add('show');
  });
  document.getElementById('sidebarBackdrop').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarBackdrop').classList.remove('show');
  });

  // Global search
  document.getElementById('globalSearch').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') N24SSSearchQuotation(e.target.value);
  });

  // Customers
  document.getElementById('addCustomerBtn').addEventListener('click', () => N24SSOpenCustomerModal());
  document.getElementById('saveCustomerBtn').addEventListener('click', N24SSCreateCustomer);
  document.getElementById('customerSearch').addEventListener('input', (e) => N24SSRenderCustomers(e.target.value));
  document.querySelector('#customersTable tbody').addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-customer]');
    const delBtn = e.target.closest('[data-delete-customer]');
    if (editBtn) N24SSOpenCustomerModal(editBtn.getAttribute('data-edit-customer'));
    if (delBtn) {
      const id = delBtn.getAttribute('data-delete-customer');
      N24SSConfirm('Delete customer?', 'This customer record will be permanently removed from this session.', () => N24SSDeleteCustomer(id));
    }
  });

  // Company profile
  document.getElementById('saveCompanyBtn').addEventListener('click', N24SSSaveCompanyProfile);
  document.getElementById('logoUploadBtn').addEventListener('click', () => document.getElementById('logoInput').click());
  document.getElementById('logoInput').addEventListener('change', (e) => N24SSHandleLogoUpload(e.target.files[0]));

  // Items
  document.getElementById('addItemBtn').addEventListener('click', () => N24SSOpenItemModal());
  document.getElementById('saveItemBtn').addEventListener('click', N24SSAddItem);
  document.querySelector('#itemsTable tbody').addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-item]');
    const delBtn = e.target.closest('[data-delete-item]');
    if (editBtn) N24SSOpenItemModal(editBtn.getAttribute('data-edit-item'));
    if (delBtn) {
      const id = delBtn.getAttribute('data-delete-item');
      N24SSConfirm('Delete item?', 'This catalog item will be permanently removed from this session.', () => N24SSDeleteItem(id));
    }
  });

  // Quotation generator
  document.getElementById('newQuotationBtn').addEventListener('click', () => {
    N24SSConfirm('Start a new quotation?', 'Unsaved changes to the current quotation will be lost.', N24SSResetQuotationForm);
  });
  document.getElementById('addQuotationItemBtn').addEventListener('click', N24SSOpenQItemModal);
  document.getElementById('qItemCatalog').addEventListener('change', (e) => N24SSFillFromCatalog(e.target.value));
  document.getElementById('saveQItemBtn').addEventListener('click', N24SSSaveQItem);
  document.getElementById('qItemsBody').addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove-qitem]');
    if (rm) N24SSRemoveQItem(rm.getAttribute('data-remove-qitem'));
  });
  ['qDiscountType', 'qDiscountValue', 'qTaxPercent'].forEach(id => {
    document.getElementById(id).addEventListener('input', N24SSCalculateTotals);
  });
  document.getElementById('previewQuotationBtn').addEventListener('click', N24SSPreviewQuotation);
  document.getElementById('saveQuotationBtn').addEventListener('click', N24SSCreateQuotation);

  // Search results view
  document.getElementById('searchResultsBody').addEventListener('click', (e) => {
    const viewBtn = e.target.closest('[data-view-quote]');
    if (viewBtn) N24SSPreviewSavedQuotation(viewBtn.getAttribute('data-view-quote'));
  });

  // PDF export
  document.getElementById('exportPdfBtn').addEventListener('click', N24SSExportPDF);

  // Generic modal close (backdrop + close buttons)
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => N24SSCloseModal(btn.getAttribute('data-close')));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });

  // Confirm modal action
  document.getElementById('confirmActionBtn').addEventListener('click', () => {
    if (typeof N24SSPendingConfirm === 'function') N24SSPendingConfirm();
    N24SSPendingConfirm = null;
    N24SSCloseModal('confirmModal');
  });
});
