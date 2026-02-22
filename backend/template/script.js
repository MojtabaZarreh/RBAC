const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, def = []) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? def;
  } catch {
    return def;
  }
};
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '');
const todayISO = () => new Date().toISOString();
const daysUntil = (iso) =>
  Math.ceil((new Date(iso) - new Date()) / 86400000);
const fmtBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
const ensureToastHost = () => {
  let host = document.getElementById('toasts');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toasts';
    host.className = 'toasts';
    host.setAttribute('aria-live', 'polite');
    host.setAttribute('aria-atomic', 'true');
    document.body.appendChild(host);
  }
  return host;
};
const toast = (msg) => {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  ensureToastHost().appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity = '.95';
    t.style.transform = 'translateY(-2px)';
  });
  setTimeout(() => t.remove(), 4200);
};

async function notify(msg) {
  try {
    if (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
    ) {
      new Notification('Domain Desk', { body: msg });
    } else if (
      typeof Notification !== 'undefined' &&
      Notification.permission !== 'denied'
    ) {
      const p = await Notification.requestPermission();
      if (p === 'granted') new Notification('Domain Desk', { body: msg });
    }
  } catch (e) {}
  toast(msg);
}

const API_BASE_URL = '/api';

const state = {
  domains: load('domains'),
  passwords: load('passwords'),
  financials: [],
  sites: load('sites'),
  ssl: [],
  servers: [],
  settings: load('settings', { expireWarnDays: 10 }),
  auth: load('auth', null),
  currentTab: 'domains',
  drawer: { mode: null, entity: null, id: null },
  search: '',
};

async function login(username, password) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Login failed');
  }
  const data = await res.json();
  localStorage.setItem('api_token', data.key);
  return data.key;
}

async function signup(username, password) {
  const res = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.username || errorData.detail || 'Signup failed');
  }
  const data = await res.json();
  return data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function showAuth() {
  const tpl = $('#auth-template').content.cloneNode(true);
  $('#root').innerHTML = '';
  $('#root').appendChild(tpl);
  let currentMode = 'login';
  const setMode = (m) => {
    currentMode = m;
    $('#authAction').textContent = m === 'login' ? 'Log in' : 'Sign up';
    $('#toggleAuth').textContent =
      m === 'login'
        ? 'First time here? Create an account.'
        : 'Already have an account? Log in.';
  };
  setMode(currentMode);
  $('#authAction').onclick = async () => {
    const user = $('#authUser').value.trim();
    const pass = $('#authPass').value;
    const msgEl = $('#authMessage');
    msgEl.textContent = '';
    if (!user || !pass) {
      msgEl.textContent = 'Enter both username and password.';
      return;
    }
    try {
      if (currentMode === 'signup') {
        await signup(user, pass);
        toast('Account created successfully!');
        setMode('login');
      } else {
        const token = await login(user, pass);
        if (token) {
          state.auth = { user, token };
          toast('✅ Welcome back !');
          await sleep(2000);
          initApp();
        }
      }
    } catch (e) {
      toast('🚫 Login failed !');
    }
  };
}

function logout() {
  const ok = confirm('Are you sure you want to log out?');
  if (!ok) return;
  localStorage.clear();
  toast('Logged out successfully !');
  showAuth();
}

function initApp() {
  const tpl = $('#app-template').content.cloneNode(true);
  const existingToasts = document.getElementById('toasts');
  const tplToasts = $('#toasts', tpl);
  if (existingToasts && tplToasts) {
    tplToasts.remove();
  }
  $('#root').innerHTML = '';
  $('#root').appendChild(tpl);
  $('#btnLogout').onclick = logout;
  $('#btnSettings').onclick = () => openSettings();
  $('#globalSearch').addEventListener('input', (e) => {
    state.search = e.target.value.toLowerCase();
    render();
  });
  $('#btnBackup').onclick = exportBackup;
  $('#btnRestore').onclick = importBackup;
  $$('.tab').forEach((tab) => {
    tab.onclick = () => {
      $$('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentTab = tab.dataset.tab;
      showTab(state.currentTab);
    };
  });
  $('#btnAddDomain').onclick = () => openDrawer('create', 'domain');
  $('#filterStatus').onchange = renderDomains;
  $('#btnAddPassword').onclick = () => openDrawer('create', 'password');
  $('#passwordSearch').oninput = renderPasswords;
  $('#btnAddFinancial').onclick = () => openDrawer('create', 'financial');
  $('#btnAddSite').onclick = () => openDrawer('create', 'site');
  $('#btnAddSsl').onclick = () => openDrawer('create', 'ssl');
  $('#btnAddServer').onclick = () => openDrawer('create', 'server');
  $('#btnDrawerCancel').onclick = closeDrawer;
  $('#btnDrawerSave').onclick = saveDrawer;
  if (location.hash === '#selftest') {
    setTimeout(runSelfChecks, 80);
  }
  showTab(state.currentTab);
  render();
  checkExpirations();
}

function showTab(tab) {
  ['domains', 'passwords', 'financial', 'websites', 'ssl', 'servers', 'about'].forEach(
    (t) => {
      const view = $('#view-' + t);
      if (view) view.classList.toggle('hidden', t !== tab);
    },
  );
}

function render() {
  renderDomains();
  renderPasswords();
  renderFinancials();
  renderSites();
  renderSsls();
  renderServers();
}

async function renderDomains() {
  const grid = $('#domainGrid');
  if (!grid) return;
  grid.innerHTML = '';
  try {
    const token = localStorage.getItem('api_token');
    const res = await fetch(`${API_BASE_URL}/domains`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    state.domains = await res.json();
  } catch (err) {
    console.error('Error loading domains:', err);
    grid.innerHTML = `<div class="card"><div class="muted">Error fetching domains from server.</div></div>`;
    return;
  }
  const filter = $('#filterStatus')?.value || '';
  const q = state.search;
  const list = state.domains
    .filter((d) => !filter || d.status === filter)
    .filter(
      (d) =>
        !q || [d.name, d.register, d.status].join(' ').toLowerCase().includes(q),
    )
    .sort((a, b) =>
      (a.expiration_date || '').localeCompare(b.expiration_date || ''),
    );
  if (list.length === 0) {
    grid.innerHTML = `<div class="card"><div class="muted">No domains yet. Click <b>Add Domain</b> to get started.</div></div>`;
    return;
  }
  list.forEach((d) => {
    const card = document.createElement('div');
    card.className = 'card';
    const days = d.expiration_date ? daysUntil(d.expiration_date) : null;
    let chip = '';
    if (days === null) chip = '<span class="chip">No expiry</span>';
    else if (days < 0) chip = '<span class="chip danger">Expired</span>';
    else if (days <= state.settings.expireWarnDays)
      chip = '<span class="chip warn">Expiring Soon</span>';
    else chip = `<span class="chip ok">${d.status}</span>`;
    card.innerHTML = `
            <div class="row spread">
            <div class="row" style="gap:8px">
                <div style="font-weight:700; font-size:16px">${d.name}</div>
                ${chip}
            </div>
            <div class="actions">
                <button class="btn" data-detail>Open</button>
                <button class="btn" data-del>Delete</button>
            </div>
            </div>
            <div class="kvs">
            <div>Registrar</div><b>${d.register || '-'}</b>
            <div>Status</div><b>${d.status || '-'}</b>
            <div>Expires</div><b>${
              d.expiration_date ? new Date(d.expiration_date).toDateString() : '-'
            }</b>
            </div>
            <div class="muted" style="font-size:13px">${
              d.description
                ? d.description.slice(0, 160) + (d.description.length > 160 ? '…' : '')
                : 'No description yet. Click Open to add.'
            }</div>
        `;
    card.querySelector('[data-del]').onclick = () => delDomain(d.id);
    card.querySelector('[data-detail]').onclick = () => openDomainDetail(d.id);
    grid.appendChild(card);
  });
}

async function openDomainDetail(id) {
  const d = state.domains.find((x) => x.id === id);
  if (!d) return;
  state.drawer = { mode: 'detail', entity: 'domain', id };
  $('#drawerTitle').textContent = `Domain · ${d.name}`;
  const body = $('#drawerBody');
  body.innerHTML = `
    <div class="two">
        <div>
        <div class="label">Domain</div>
        <input class="input" id="domName" value="${d.name}" />
        </div>
        <div>
        <div class="label">Registrar</div>
        <input class="input" id="domReg" value="${d.register || ''}" />
        </div>
    </div>
    <div class="two">
        <div>
        <div class="label">Status</div>
        <select id="domStatus">
            ${['Active', 'Parked', 'Expiring Soon', 'Expired']
              .map((s) => `<option ${s === d.status ? 'selected' : ''}>${s}</option>`)
              .join('')}
        </select>
        </div>
        <div>
        <div class="label">Expiration date</div>
        <input class="input" id="domExp" type="date" value="${
          d.expiration_date ? new Date(d.expiration_date).toISOString().slice(0, 10) : ''
        }" />
        </div>
    </div>
    <div>
        <div class="label">Description (full)</div>
        <textarea id="domNotes" placeholder="Notes, DNS, contacts, renewal reminders, etc.">${
          d.description || ''
        }</textarea>
    </div>
    <div class="card">
        <div class="row spread"><b>History</b><button class="btn" id="btnAddHist">Add note</button></div>
        <div id="hist"></div>
    </div>
    `;
  let history = await fetch(`${API_BASE_URL}/domains/${id}/actions`
    , { headers: { Authorization: `Bearer ${localStorage.getItem('api_token')}` } }
  );
  const histEl = $('#hist');
  const hist = await history.json();
  histEl.innerHTML = hist.length
    ? hist
        .map(
          (h) =>
            `<div class="row" style="gap:8px"><span class="chip">${new Date(
              h.created_at,
            ).toLocaleString()}</span> <div>${h.description}</div></div>`,
        )
        .join('')
    : '<div class="muted">No history yet.</div>';

  $('#btnAddHist').onclick = async () => {
    const text = prompt('History entry');
    if (!text) return;

    await fetch(`${API_BASE_URL}/domains/${id}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'
        , Authorization: `Bearer ${localStorage.getItem('api_token')}`
       },
      body: JSON.stringify({
        description: text,
        created_at: new Date().toISOString()
      }),
    });
    toast('History added.');
    openDomainDetail(id);
  };
  openOverlay(true);
}

async function delDomain(id) {
  if (!confirm('Delete this domain?')) return;
  const token = localStorage.getItem('api_token');
  try {
    let res = await fetch(`${API_BASE_URL}/domains/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      state.domains = state.domains.filter((d) => d.id !== id);
      save('domains', state.domains);
      toast('Domain deleted.');
      renderDomains();
    } else {
      let err = await res.json();
      toast('Error: ' + (err.detail || 'Failed to delete.'));
    }
  } catch (e) {
    toast('Network error: ' + e.message);
  }
}

function openDrawer(mode, entity, id = null) {
  state.drawer = { mode, entity, id };
  $('#drawerTitle').textContent = (mode === 'create' ? 'New ' : 'Edit ') + entity;
  const body = $('#drawerBody');
  if (entity === 'domain') {
    const d = id
      ? state.domains.find((x) => x.id === id)
      : { name: '', registrar: '', status: 'Active', expiresOn: '', notes: '' };
    body.innerHTML = `
        <div>
        <div class="label">Domain name</div>
        <input class="input" id="domName" placeholder="example.com" value="${
          d.name || ''
        }" />
        </div>
        <div class="two">
        <div>
            <div class="label">Registrar</div>
            <input class="input" id="domReg" placeholder="Namecheap, Cloudflare…" value="${
              d.registrar || ''
            }" />
        </div>
        <div>
            <div class="label">Status</div>
            <select id="domStatus">
            <option ${d.status === 'Active' ? 'selected' : ''}>Active</option>
            <option ${d.status === 'Parked' ? 'selected' : ''}>Parked</option>
            <option ${d.status === 'Expiring Soon' ? 'selected' : ''}>Expiring Soon</option>
            <option ${d.status === 'Expired' ? 'selected' : ''}>Expired</option>
            </select>
        </div>
        </div>
        <div class="two">
        <div>
            <div class="label">Expiration date</div>
            <input class="input" id="domExp" type="date" value="${
              d.expiresOn ? new Date(d.expiresOn).toISOString().slice(0, 10) : ''
            }" />
        </div>
        <div>
            <div class="label">Description</div>
            <input class="input" id="domNotes" placeholder="Short notes" value="${
              d.notes || ''
            }" />
        </div>
        </div>
    `;
  } else if (entity === 'financial') {
    const f = id
      ? state.financials.find((x) => x.id === id)
      : { subject: '', record_date: '', description: '' };
    body.innerHTML = `
        <div>
            <div class="label">Subject / Title</div>
            <input class="input" id="finSubject" placeholder="e.g., Annual Hosting Invoice" value="${f.subject || ''}" />
        </div>
        <div>
            <div class="label">Record Date</div>
            <input class="input" id="finDate" type="date" value="${
              f.record_date ? new Date(f.record_date).toISOString().slice(0, 10) : ''
            }" />
        </div>
        <div>
            <div class="label">Description</div>
            <textarea id="finNotes" placeholder="More details, tracking numbers, etc.">${
              f.description || ''
            }</textarea>
        </div>
        <div>
            <div class="label">Attachments</div>
            <div class="file-drop-zone" id="finFileDropZone">
                <input id="finFiles" type="file" multiple />
                <p>Drag & drop files here, or click to select files</p>
            </div>
            <div id="finFileList" class="file-list"></div>
        </div>
    `;
    
    const dropZone = $('#finFileDropZone', body);
    const fileInput = $('#finFiles', body);
    const fileList = $('#finFileList', body);

    const updateFileList = () => {
        fileList.innerHTML = '';
        if (!fileInput.files.length) {
            return;
        }
        for (const file of fileInput.files) {
            const item = document.createElement('div');
            item.className = 'file-list-item';
            item.innerHTML = `
                <div class="file-icon">📄</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fmtBytes(file.size)}</div>
                </div>
            `;
            fileList.appendChild(item);
        }
    };
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        fileInput.files = e.dataTransfer.files;
        updateFileList();
    });

    fileInput.addEventListener('change', updateFileList);

  } else if (entity === 'ssl') {
    const s = id
      ? state.ssl.find((x) => x.id === id)
      : { name: '', issuer: '', expiration_date: '', description: '' };
    body.innerHTML = `
            <div>
            <div class="label">Certificate Name (Domain)</div>
            <input class="input" id="sslName" placeholder="example.com" value="${
              s.name || ''
            }" />
            </div>
            <div class="two">
            <div>
                <div class="label">Issuer</div>
                <input class="input" id="sslIssuer" placeholder="Let's Encrypt, Cloudflare…" value="${
                  s.issuer || ''
                }" />
            </div>
            <div>
                <div class="label">Expiration date</div>
                <input class="input" id="sslExp" type="date" value="${
                  s.expiration_date
                    ? new Date(s.expiration_date).toISOString().slice(0, 10)
                    : ''
                }" />
            </div>
            </div>
            <div>
            <div class="label">Description</div>
            <textarea id="sslNotes" placeholder="Notes, renewal reminders, etc.">${
              s.description || ''
            }</textarea>
            </div>
        `;
  } else if (entity === 'server') {
    const s = id
      ? state.servers.find((x) => x.id === id)
      : {
          name: '',
          ip_address: '',
          location: '',
          description: '',
          expiration_date: '',
        };
    body.innerHTML = `
            <div>
            <div class="label">Server Name</div>
            <input class="input" id="serverName" placeholder="myserver.example.com" value="${
              s.name || ''
            }" />
            </div>
            <div class="two">
            <div>
                <div class="label">IP Address</div>
                <input class="input" id="serverIp" placeholder="192.168.1.1" value="${
                  s.ip_address || ''
                }" />
            </div>
            <div>
                <div class="label">Location</div>
                <input class="input" id="serverLoc" placeholder="Hosting provider, data center" value="${
                  s.location || ''
                }" />
            </div>
            </div>
            <div>
                <div class="label">Expiration date</div>
                <input class="input" id="serverExp" type="date" value="${
                  s.expiration_date
                    ? new Date(s.expiration_date).toISOString().slice(0, 10)
                    : ''
                }" />
            </div>
            <div>
                <div class="label">Description</div>
                <textarea id="serverNotes" placeholder="Credentials, software, notes, etc.">${
                  s.description || ''
                }</textarea>
            </div>
        `;
  } else if (entity === 'password') {
    const p = id
      ? state.passwords.find((x) => x.id === id)
      : { label: '', username: '', password: '', url: '', notes: '' };
    body.innerHTML = `
        <div class="two">
        <div>
            <div class="label">Label</div>
            <input class="input" id="pwLabel" placeholder="Email / cPanel / Admin…" value="${
              p.label || ''
            }" />
        </div>
        <div>
            <div class="label">Username</div>
            <input class="input" id="pwUser" value="${p.username || ''}" />
        </div>
        </div>
        <div class="two">
        <div>
            <div class="label">Password</div>
            <input class="input" id="pwPass" type="text" value="${
              p.password || ''
            }" />
        </div>
        <div>
            <div class="label">URL</div>
            <input class="input" id="pwUrl" placeholder="https://…" value="${p.url || ''}" />
        </div>
        </div>
        <div>
        <div class="label">Description</div>
        <textarea id="pwNotes" placeholder="Notes, recovery codes, security Qs (avoid real secrets in demo).">${
          p.notes || ''
        }</textarea>
        </div>
    `;
  }
  if (entity === 'site') {
    const s = id
      ? state.sites.find((x) => x.id === id)
      : { url: '', notes: '' };
    body.innerHTML = `
        <div>
        <div class="label">Website URL</div>
        <input class="input" id="siteUrl" placeholder="https://example.com" value="${
          s.url || ''
        }" />
        </div>
        <div>
        <div class="label">Description</div>
        <textarea id="siteNotes" placeholder="What is this site?">${
          s.notes || ''
        }</textarea>
        </div>
    `;
  }
  openOverlay(true);
}

async function saveDrawer() {
  const { mode, entity, id } = state.drawer;
  const token = localStorage.getItem('api_token');
  if (entity === 'domain') {
    const name = $('#domName').value.trim();
    if (!name) return toast('Domain name is required.');
    const payload = {
      name,
      register: $('#domReg').value.trim(),
      status: $('#domStatus').value,
      expiration_date: $('#domExp').value || null,
      description: $('#domNotes').value.trim(),
    };
    const url = id ? `${API_BASE_URL}/domains/${id}` : `${API_BASE_URL}/domains`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return toast('Error saving domain.');
    toast('Domain saved.');
    closeDrawer();
    renderDomains();
  } else if (entity === 'financial') {
    const subject = $('#finSubject').value.trim();
    if (!subject) return toast('Subject is required.');

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('record_date', $('#finDate').value || '');
    formData.append('description', $('#finNotes').value.trim() || '');

    const files = $('#finFiles').files;
    if (files && files.length > 0) {
        for (const file of files) {
            formData.append('files', file);
        }
    }

    const url = id ? `${API_BASE_URL}/financial-records/${id}` : `${API_BASE_URL}/financial-records`;
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Failed to save financial record.');
        }

        toast('Financial record saved.');
        closeDrawer();
        renderFinancials();
    } catch (e) {
        toast('Error saving financial record: ' + e.message);
    }
} else if (entity === 'ssl') {
    const name = $('#sslName').value.trim();
    if (!name) return toast('Certificate name is required.');
    const payload = {
      name,
      issuer: $('#sslIssuer').value.trim(),
      expiration_date: $('#sslExp').value || null,
      description: $('#sslNotes').value.trim(),
    };
    const url = id ? `${API_BASE_URL}/ssl/${id}` : `${API_BASE_URL}/ssl`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return toast('Error saving SSL certificate.');
    toast('SSL certificate saved.');
    closeDrawer();
    renderSsls();
  } else if (entity === 'server') {
    const name = $('#serverName').value.trim();
    if (!name) return toast('Server name is required.');
    const payload = {
      name: $('#serverName').value.trim(),
      ip_address: $('#serverIp').value.trim(),
      location: $('#serverLoc').value.trim(),
      description: $('#serverNotes').value.trim(),
      expiration_date: $('#serverExp').value || null,
    };
    const url = id ? `${API_BASE_URL}/servers/${id}` : `${API_BASE_URL}/servers`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return toast('Error saving server.');
    toast('Server saved.');
    closeDrawer();
    renderServers();
  }
  if (entity === 'password') {
    const label = $('#pwLabel').value.trim();
    if (!label) return toast('Label is required.');
    const payload = {
      label,
      username: $('#pwUser').value,
      password: $('#pwPass').value,
      url: $('#pwUrl').value,
      notes: $('#pwNotes').value,
    };
    const url = id
      ? `${API_BASE_URL}/passwords/${id}`
      : `${API_BASE_URL}/passwords`;
    const method = id ? 'PUT' : 'POST';
    const token = localStorage.getItem('api_token');
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return toast('Error saving password.');
    toast('Password saved.');
    closeDrawer();
    renderPasswords();
  }
  if (entity === 'site') {
    const urlVal = $('#siteUrl').value.trim();
    if (!urlVal) return toast('URL is required.');
    const payload = {
      url: urlVal,
      description: $('#siteNotes').value.trim(),
    };
    const url = id
      ? `${API_BASE_URL}/websites/${id}`
      : `${API_BASE_URL}/websites`;
    const method = id ? 'PUT' : 'POST';
    const token = localStorage.getItem('api_token');
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return toast('Error saving website.');
    toast('Website saved.');
    closeDrawer();
    renderSites();
  }
}

function openOverlay(show) {
  $('#overlay').classList.toggle('show', !!show);
}
function closeDrawer() {
  openOverlay(false);
  state.drawer = { mode: null, entity: null, id: null };
}

function checkExpirations() {
  state.domains.forEach(checkSingleExpiration);
}
function checkSingleExpiration(d) {
  if (!d.expiration_date) return;
  const days = daysUntil(d.expiration_date);
  if (days < 0) {
    notify(`Domain ${d.name} is expired!`);
  } else if (days <= state.settings.expireWarnDays) {
    notify(`Domain ${d.name} expires in ${days} day(s).`);
  }
}

async function renderFinancials() {
    const grid = $('#financialGrid');
    if (!grid) return;
    grid.innerHTML = '';
    try {
        const token = localStorage.getItem('api_token');
        const res = await fetch(`${API_BASE_URL}/financial-records`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch financial records.');
        state.financials = await res.json();
    } catch (err) {
        console.error('Error loading financial records:', err);
        grid.innerHTML = `<div class="card"><div class="muted">Error fetching financial records from server.</div></div>`;
        return;
    }

    const q = state.search;
    const list = state.financials
        .filter(f => !q || [f.subject, f.description].join(' ').toLowerCase().includes(q))
        .sort((a, b) => (b.record_date || '').localeCompare(a.record_date || ''));

    if (list.length === 0) {
        grid.innerHTML = `<div class="card"><div class="muted">No financial records yet. Click <b>Add Financial Record</b> to get started.</div></div>`;
        return;
    }

    list.forEach(f => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const downloadButtonHTML = f.attacghment && f.attacghment.length > 0 ? `
            <button class="btn-icon" data-download title="Download all files as .zip">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
        ` : '';

        card.innerHTML = `
            <div class="row spread">
                <div style="font-weight:700; font-size:16px">${f.subject}</div>
                <div class="actions">
                    ${downloadButtonHTML}
                    <button class="btn" data-edit>Open</button>
                    <button class="btn" data-del>Delete</button>
                </div>
            </div>
            <div class="kvs">
                <div>Date</div><b>${f.record_date ? new Date(f.record_date).toDateString() : '-'}</b>
                <div>Files</div><b>${f.attacghment ? f.attacghment.length : 0} attached</b>
            </div>
            <div class="muted" style="font-size:13px">${
              f.description
                ? f.description.slice(0, 160) + (f.description.length > 160 ? '…' : '')
                : 'No description.'
            }</div>
        `;
        card.querySelector('[data-edit]').onclick = () => openDrawer('edit', 'financial', f.id);
        card.querySelector('[data-del]').onclick = () => delFinancial(f.id);
        
        if (f.attacghment && f.attacghment.length > 0) {
            card.querySelector('[data-download]').onclick = () => downloadFinancialFiles(f.id, f.subject, f.attacghment);
        }

        grid.appendChild(card);
    });
}

async function delFinancial(id) {
    if (!confirm('Are you sure you want to delete this financial record?')) return;
    const token = localStorage.getItem('api_token');
    try {
        const res = await fetch(`${API_BASE_URL}/financial-records/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete.');
        toast('Financial record deleted.');
        renderFinancials();
    } catch (e) {
        toast('Error deleting financial record.');
    }
}

async function downloadFinancialFiles(id, subject, files) {
    toast(`Preparing download for "${subject}"...`);
    try {
        for (const fileUrl of files) {
            const res = await fetch(fileUrl);
            if (!res.ok) throw new Error('Failed to fetch ' + fileUrl);

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            const filename = fileUrl.split('/').pop();
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        }
        toast('Download started successfully!');
    } catch (err) {
        console.error('Download failed:', err);
        toast('Download failed. Please try again.');
    }
}


async function renderSsls() {
  const grid = $('#sslGrid');
  if (!grid) return;
  grid.innerHTML = '';
  try {
    const token = localStorage.getItem('api_token');
    const res = await fetch(`${API_BASE_URL}/ssl`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    state.ssl = await res.json();
  } catch (err) {
    console.error('Error loading SSL certificates:', err);
    grid.innerHTML = `<div class="card"><div class="muted">Error fetching SSL certificates from server.</div></div>`;
    return;
  }
  const q = state.search;
  const list = state.ssl
    .filter(
      (s) =>
        !q || [s.name, s.issuer, s.description].join(' ').toLowerCase().includes(q),
    )
    .sort((a, b) =>
      (a.expiration_date || '').localeCompare(b.expiration_date || ''),
    );
  if (list.length === 0) {
    grid.innerHTML = `<div class="card"><div class="muted">No SSL certificates yet. Click <b>Add SSL Cert</b> to get started.</div></div>`;
    return;
  }
  list.forEach((s) => {
    const card = document.createElement('div');
    card.className = 'card';
    const days = s.expiration_date ? daysUntil(s.expiration_date) : null;
    let chip = '';
    if (days === null) chip = '<span class="chip">Unknown</span>';
    else if (days < 0) chip = '<span class="chip danger">Expired</span>';
    else if (days <= state.settings.expireWarnDays)
      chip = '<span class="chip warn">Expiring Soon</span>';
    else chip = `<span class="chip ok">Active</span>`;
    card.innerHTML = `
            <div class="row spread">
                <div class="row" style="gap:8px">
                    <div style="font-weight:700; font-size:16px">${s.name}</div>
                    ${chip}
                </div>
                <div class="actions">
                    <button class="btn" data-edit>Edit</button>
                    <button class="btn" data-del>Delete</button>
                </div>
            </div>
            <div class="kvs">
                <div>Issuer</div><b>${s.issuer || '-'}</b>
                <div>Expires</div><b>${
                  s.expiration_date ? new Date(s.expiration_date).toDateString() : '-'
                }</b>
            </div>
            <div class="muted" style="font-size:13px">${
              s.description
                ? s.description.slice(0, 160) + (s.description.length > 160 ? '…' : '')
                : 'No description.'
            }</div>
        `;
    card.querySelector('[data-edit]').onclick = () => openDrawer('edit', 'ssl', s.id);
    card.querySelector('[data-del]').onclick = async () => {
      if (confirm('Delete this SSL certificate?')) {
        try {
          const token = localStorage.getItem('api_token');
          const res = await fetch(`${API_BASE_URL}/ssl/${s.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            toast('SSL cert deleted.');
            renderSsls();
          } else {
            toast('Error deleting SSL cert.');
          }
        } catch (e) {
          toast('Network error: ' + e.message);
        }
      }
    };
    grid.appendChild(card);
  });
}

async function renderServers() {
  const grid = $('#serverGrid');
  if (!grid) return;
  grid.innerHTML = '';
  try {
    const token = localStorage.getItem('api_token');
    const res = await fetch(`${API_BASE_URL}/servers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    state.servers = await res.json();
  } catch (err) {
    console.error('Error loading servers:', err);
    grid.innerHTML = `<div class="card"><div class="muted">Error fetching servers from server.</div></div>`;
    return;
  }
  const q = state.search;
  const list = state.servers
    .filter(
      (s) =>
        !q ||
        [s.name, s.ip, s.location, s.notes].join(' ').toLowerCase().includes(q),
    )
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  if (list.length === 0) {
    grid.innerHTML = `<div class="card"><div class="muted">No servers yet. Click <b>Add Server</b> to get started.</div></div>`;
    return;
  }
  list.forEach((s) => {
    const card = document.createElement('div');
    card.className = 'card';
    const days = s.expiration_date ? daysUntil(s.expiration_date) : null;
    let chip = '';
    if (days === null) chip = '<span class="chip">No expiry</span>';
    else if (days < 0) chip = '<span class="chip danger">Expired</span>';
    else if (days <= state.settings.expireWarnDays)
      chip = '<span class="chip warn">Expiring Soon</span>';
    else chip = `<span class="chip ok">Active</span>`;
    card.innerHTML = `
            <div class="row spread">
                <div class="row" style="gap:8px">
                    <div style="font-weight:700; font-size:16px">${s.name}</div>
                    ${chip}
                </div>
                <div class="actions">
                    <button class="btn" data-edit>Open</button>
                    <button class="btn" data-del>Delete</button>
                </div>
            </div>
            <div class="kvs">
                <div>IP Address</div><b>${s.ip_address || '-'}</b>
                <div>Location</div><b>${s.location || '-'}</b>
                <div>Expires</div><b>${
                  s.expiration_date ? new Date(s.expiration_date).toDateString() : '-'
                }</b>
            </div>
            <div class="muted" style="font-size:13px">${
              s.description
                ? s.description.slice(0, 160) + (s.description.length > 160 ? '…' : '')
                : 'No description.'
            }</div>
        `;
    card.querySelector('[data-edit]').onclick = () =>
      openDrawer('edit', 'server', s.id);
    card.querySelector('[data-del]').onclick = async () => {
      if (confirm('Delete this server?')) {
        try {
          const token = localStorage.getItem('api_token');
          const res = await fetch(`${API_BASE_URL}/servers/${s.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            toast('Server deleted.');
            renderServers();
          } else {
            toast('Error deleting server.');
          }
        } catch (e) {
          toast('Network error: ' + e.message);
        }
      }
    };
    grid.appendChild(card);
  });
}

async function renderPasswords() {
  const tbody = $('#passwordTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  try {
    const token = localStorage.getItem('api_token');
    const res = await fetch(`${API_BASE_URL}/passwords`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch passwords');
    state.passwords = await res.json();

    const q = ($('#passwordSearch')?.value || state.search || '').toLowerCase();
    state.passwords
      .filter(
        (p) =>
          !q ||
          [p.label, p.username, p.url].join(' ').toLowerCase().includes(q),
      )
      .forEach((p) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.label}</td>
          <td>${p.username || ''}</td>
          <td>
              <span style="cursor:pointer" title="Reveal" data-eye>👁</span>
              <span data-secret>••••••••••••</span>
          </td>
          <td>${
            p.url ? `<a href="${p.url}" target="_blank" rel="noopener">link</a>` : ''
          }</td>
          <td>${fmtDate(p.updated_at || p.created_at)}</td>
          <td class="actions">
              <button class="btn" data-del>Delete</button>
              <button class="btn" data-open>Open</button>
          </td>`;
        tr.querySelector('[data-eye]').onclick = () => {
          const s = tr.querySelector('[data-secret]');
          s.textContent = p.password || '';
          setTimeout(() => {
            s.textContent = '••••••••••••';
          }, 7000);
        };
        tr.querySelector('[data-del]').onclick = async () => {
          if (confirm('Delete this password?')) {
            try {
              await fetch(`${API_BASE_URL}/passwords/${p.id}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              state.passwords = state.passwords.filter((x) => x.id !== p.id);
              renderPasswords();
              toast('Password deleted.');
            } catch (err) {
              console.error(err);
              toast('Failed to delete password.');
            }
          }
        };

        tr.querySelector('[data-open]').onclick = () => openPasswordDetail(p.id);

        tbody.appendChild(tr);
      });
  } catch (err) {
    console.error(err);
    toast('Error loading passwords.');
  }
}

function openPasswordDetail(id) {
  const p = state.passwords.find((x) => x.id === id);
  if (!p) return;
  state.drawer = { mode: 'detail', entity: 'password', id };
  $('#drawerTitle').textContent = `Password · ${p.label}`;
  $('#drawerBody').innerHTML = `
    <div class="two">
        <div>
        <div class="label">Label</div>
        <input class="input" id="pwLabel" value="${p.label}" />
        </div>
        <div>
        <div class="label">Username</div>
        <input class="input" id="pwUser" value="${p.username || ''}" />
        </div>
    </div>
    <div class="two">
        <div>
        <div class="label">Password</div>
        <input class="input" id="pwPass" type="text" value="${p.password || ''}" />
        </div>
        <div>
        <div class="label">URL</div>
        <input class="input" id="pwUrl" value="${p.url || ''}" />
        </div>
    </div>
    <div>
        <div class="label">Description</div>
        <textarea id="pwNotes">${p.notes || ''}</textarea>
    </div>
    `;
  openOverlay(true);
}

async function renderSites() {
  const token = localStorage.getItem('api_token');
  const res = await fetch(`${API_BASE_URL}/websites`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const grid = $('#siteGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!res.ok) {
    grid.innerHTML = `<div class="card"><div class="muted">Error loading websites.</div></div>`;
    return;
  }
  const sites = await res.json();
  state.sites = sites;
  if (sites.length === 0) {
    grid.innerHTML = `<div class="card"><div class="muted">No websites yet. Click <b>Add Website</b> to add one.</div></div>`;
    return;
  }
  sites.forEach((s) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = s.id;
    const statusChip = s.status === 'up' ? 'ok' : s.status === 'down' ? 'danger' : '';
    const displayUrl = s.url.replace(/^https?:\/\//, '');
    card.innerHTML = `
            <div class="row spread">
                <div class="row" style="gap:8px"><b>${displayUrl}</b> <span class="chip ${statusChip}">${
                  s.status || 'unknown'
                }</span></div>
                <div class="actions">
                    <button class="btn" data-check>Check</button>
                    <button class="btn" data-del>Delete</button>
                </div>
            </div>
            <div class="muted" style="font-size:13px">${s.description || ''}</div>
            <div class="kvs"><div>Last checked</div><b>${
              s.last_checked ? new Date(s.last_checked).toLocaleString() : '-'
            }</b></div>
        `;
    card.querySelector('[data-del]').onclick = async () => {
      if (confirm('Delete this website?')) {
        const token = localStorage.getItem('api_token');
        try {
          const delRes = await fetch(`${API_BASE_URL}/websites/${s.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!delRes.ok) throw new Error('Failed to delete');
          toast('Website deleted.');
          renderSites();
        } catch (err) {
          console.error(err);
          toast('Error deleting website', 'error');
        }
      }
    };
    card.querySelector('[data-check]').onclick = () => checkSite(s.id);
    grid.appendChild(card);
  });
}

async function checkSite(id) {
  const s = state.sites.find((x) => x.id === id);
  if (!s) return;
  const url = s.url.startsWith('http') ? s.url : 'https://' + s.url;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    await fetch(url, { mode: 'no-cors', signal: controller.signal });
    clearTimeout(timeout);
    s.status = 'up';
  } catch (e) {
    s.status = 'down';
  }
  s.lastChecked = todayISO();
  save('sites', state.sites);
  const token = localStorage.getItem('api_token');
  await fetch(`${API_BASE_URL}/websites/${s.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 
      Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: s.status }),
  });
  renderSites();
  if (s.status === 'up')
    toast(`✅ ${s.url} is reachable (status: ${s.status})`);
  else
    toast(`❌ ${s.url} seems down (status: ${s.status})`, 'error');
}

function openSettings() {
  state.drawer = { mode: 'settings' };
  $('#drawerTitle').textContent = 'Settings';
  $('#drawerBody').innerHTML = `
    <div class="two">
        <div>
        <div class="label">Warn days before expiration</div>
        <input class="input" id="setWarn" type="number" min="1" max="120" value="${state.settings.expireWarnDays}" />
        </div>
        <div>
        <div class="label">Request browser notifications</div>
        <button class="btn" id="btnNPerm">Request permission</button>
        </div>
    </div>
    <div class="small muted">Notifications are best-effort and require allowing the browser to show notifications.</div>
    `;
  $('#btnDrawerSave').onclick = () => {
    const v = parseInt($('#setWarn').value || '30', 10);
    state.settings.expireWarnDays = isNaN(v) ? 30 : v;
    save('settings', state.settings);
    toast('Settings saved.');
    closeDrawer();
  };
  $('#btnNPerm').onclick = () => notify('Notifications enabled (test).');
  openOverlay(true);
}

function exportBackup() {
  const data = {
    domains: state.domains,
    passwords: state.passwords,
    sites: state.sites,
    ssl: state.ssl,
    servers: state.servers,
    settings: state.settings,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'domain-desk-backup.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup exported.');
}

function importBackup() {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'application/json';
  inp.onchange = () => {
    const f = inp.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        state.domains = data.domains || [];
        state.passwords = data.passwords || [];
        state.sites = data.sites || [];
        state.ssl = data.ssl || [];
        state.servers = data.servers || [];
        state.settings = data.settings || state.settings;
        save('domains', state.domains);
        save('passwords', state.passwords);
        save('sites', state.sites);
        save('ssl', data.ssl);
        save('servers', data.servers);
        save('settings', state.settings);
        render();
        toast('Backup imported.');
      } catch (e) {
        toast('Invalid backup file.');
      }
    };
    r.readAsText(f);
  };
  inp.click();
}

async function checkAuthAndInit() {
  const token = localStorage.getItem('api_token');
  if (!token) {
    showAuth();
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const userData = await res.json();
      state.auth = { user: userData.username, token };
      initApp();
    } else {
      localStorage.removeItem('api_token');
      showAuth();
    }
  } catch (err) {
    console.error('Network or server error:', err);
    showAuth();
  }
}
window.addEventListener('load', checkAuthAndInit);