/* PDYNO.4 — Stock Query Server Vanilla Frontend */
const API = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://stockqueryserver.vercel.app';

let token = localStorage.getItem('sqs_token') || '';
let user = JSON.parse(localStorage.getItem('sqs_user') || 'null');

// DOM refs
const tabs = document.querySelectorAll('.tab');
const contents = {
  healthStatus: document.getElementById('health-status'),
  stocksBody: document.getElementById('stocks-body'),
  topkBody: document.getElementById('topk-body'),
  graphResult: document.getElementById('graph-result'),
  userDisplay: document.getElementById('user-display'),
  loginBtn: document.getElementById('login-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  loginModal: document.getElementById('login-modal'),
  loginForm: document.getElementById('login-form'),
  loginError: document.getElementById('login-error'),
  refreshStocks: document.getElementById('refresh-stocks'),
  refreshTopk: document.getElementById('refresh-topk'),
  kInput: document.getElementById('k-input'),
  sectorInput: document.getElementById('sector-input'),
  bfsBtn: document.getElementById('bfs-btn'),
  dfsBtn: document.getElementById('dfs-btn'),
  alertForm: document.getElementById('alert-form'),
  alertAuthMsg: document.getElementById('alert-auth-msg'),
  createAlert: document.getElementById('create-alert'),
  undoAlert: document.getElementById('undo-alert'),
  alertResult: document.getElementById('alert-result'),
  alertSymbol: document.getElementById('alert-symbol'),
  alertType: document.getElementById('alert-type'),
  alertThreshold: document.getElementById('alert-threshold'),
  runBenchmarks: document.getElementById('run-benchmarks'),
  benchAuthMsg: document.getElementById('bench-auth-msg'),
  benchResults: document.getElementById('bench-results'),
};

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// Auth state
function updateAuthUI() {
  if (user) {
    contents.userDisplay.textContent = `👤 ${user.role} (${user.email})`;
    contents.loginBtn.style.display = 'none';
    contents.logoutBtn.style.display = 'inline-block';
    if (user.role === 'admin' || user.role === 'analyst') {
      contents.alertForm.style.display = 'flex';
      contents.alertAuthMsg.style.display = 'none';
    }
    if (user.role === 'admin') {
      contents.runBenchmarks.style.display = 'inline-block';
      contents.benchAuthMsg.style.display = 'none';
    }
  } else {
    contents.userDisplay.textContent = '';
    contents.loginBtn.style.display = 'inline-block';
    contents.logoutBtn.style.display = 'none';
    contents.alertForm.style.display = 'none';
    contents.alertAuthMsg.style.display = 'block';
    contents.runBenchmarks.style.display = 'none';
    contents.benchAuthMsg.style.display = 'block';
  }
}

// Login modal
contents.loginBtn.addEventListener('click', () => {
  contents.loginModal.style.display = 'flex';
  contents.loginError.textContent = '';
});

document.querySelector('.close-modal').addEventListener('click', () => {
  contents.loginModal.style.display = 'none';
});

contents.loginModal.addEventListener('click', (e) => {
  if (e.target === contents.loginModal) contents.loginModal.style.display = 'none';
});

contents.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email.split('@')[0], email, password }),
    });
    if (!res.ok) { contents.loginError.textContent = 'Invalid credentials'; return; }
    const data = await res.json();
    token = data.access_token;
    user = { email, role: data.role || 'viewer' };
    localStorage.setItem('sqs_token', token);
    localStorage.setItem('sqs_user', JSON.stringify(user));
    contents.loginModal.style.display = 'none';
    updateAuthUI();
  } catch (err) {
    contents.loginError.textContent = 'Connection error';
  }
});

contents.logoutBtn.addEventListener('click', () => {
  token = '';
  user = null;
  localStorage.removeItem('sqs_token');
  localStorage.removeItem('sqs_user');
  updateAuthUI();
});

// API helpers
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (res.status === 401 && token) {
    token = ''; user = null;
    localStorage.removeItem('sqs_token');
    localStorage.removeItem('sqs_user');
    updateAuthUI();
  }
  return res;
}

// Dashboard health
async function checkHealth() {
  try {
    const res = await api('/api/health');
    if (res.ok) {
      contents.healthStatus.innerHTML = '<span style="color:var(--gain)">✅ Healthy</span>';
    } else {
      contents.healthStatus.innerHTML = '<span style="color:var(--loss)">❌ Unhealthy</span>';
    }
  } catch {
    contents.healthStatus.innerHTML = '<span style="color:var(--loss)">❌ Offline</span>';
  }
}

// Stocks
async function loadStocks() {
  contents.stocksBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
  try {
    const res = await api('/api/stocks');
    if (!res.ok) { contents.stocksBody.innerHTML = '<tr><td colspan="4">Error loading stocks</td></tr>'; return; }
    const stocks = await res.json();
    if (!stocks.length) { contents.stocksBody.innerHTML = '<tr><td colspan="4">No stocks loaded</td></tr>'; return; }
    contents.stocksBody.innerHTML = stocks.map(s => {
      const price = s.price || s.record?.price || 0;
      const volume = s.volume || s.record?.volume || 0;
      const sector = s.sector || s.record?.sector || '--';
      const symbol = s.symbol || s.record?.symbol || '--';
      return `<tr><td><strong>${symbol}</strong></td><td class="${price >= 0 ? 'gain' : 'loss'}">$${Number(price).toFixed(2)}</td><td>${Number(volume).toLocaleString()}</td><td>${sector}</td></tr>`;
    }).join('');
  } catch { contents.stocksBody.innerHTML = '<tr><td colspan="4">Connection error</td></tr>'; }
}

// Top K
async function loadTopK() {
  const k = parseInt(contents.kInput.value) || 5;
  contents.topkBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
  try {
    const res = await api(`/api/stocks/top?k=${k}`);
    if (!res.ok) { contents.topkBody.innerHTML = '<tr><td colspan="4">Error</td></tr>'; return; }
    const stocks = await res.json();
    contents.topkBody.innerHTML = stocks.map((s, i) =>
      `<tr><td>${i + 1}</td><td><strong>${s.symbol}</strong></td><td style="color:var(--gain)">$${Number(s.price).toFixed(2)}</td><td>${s.sector || '--'}</td></tr>`
    ).join('');
  } catch { contents.topkBody.innerHTML = '<tr><td colspan="4">Connection error</td></tr>'; }
}

// Sector Graph
async function traverseGraph(mode) {
  const sector = contents.sectorInput.value.trim().toUpperCase() || 'TECH';
  contents.graphResult.textContent = 'Traversing...';
  try {
    const path = mode === 'bfs' ? `/api/stocks/sector/${sector}/friends` : `/api/stocks/sector/${sector}/friends/DFS`;
    const res = await api(path);
    if (!res.ok) { contents.graphResult.textContent = `Error: ${res.status}`; return; }
    const data = await res.json();
    contents.graphResult.textContent = JSON.stringify(data, null, 2);
  } catch { contents.graphResult.textContent = 'Connection error'; }
}

// Alerts
async function createAlert() {
  const payload = {
    symbol: contents.alertSymbol.value.toUpperCase(),
    type: contents.alertType.value,
    threshold: parseFloat(contents.alertThreshold.value),
  };
  try {
    const res = await api('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    contents.alertResult.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  } catch {
    contents.alertResult.innerHTML = '<span style="color:var(--loss)">Error creating alert</span>';
  }
}

async function undoAlert() {
  try {
    const res = await api('/api/alerts/undo', { method: 'DELETE' });
    const data = await res.json();
    contents.alertResult.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  } catch {
    contents.alertResult.innerHTML = '<span style="color:var(--loss)">Error undoing alert</span>';
  }
}

// Benchmarks
async function runBenchmarks() {
  contents.benchResults.innerHTML = '<p>Running benchmarks (this may take a moment)...</p>';
  try {
    const res = await api('/api/benchmarks');
    if (!res.ok) { contents.benchResults.innerHTML = '<p style="color:var(--loss)">Benchmark error</p>'; return; }
    const data = await res.json();
    const results = data.results || data || [];
    if (!results.length) { contents.benchResults.innerHTML = '<p>No benchmark data</p>'; return; }
    let html = `<table class="bench-table"><thead><tr>
      <th>Structure</th><th>Operation</th><th>N=100</th><th>N=1K</th><th>N=10K</th><th>N=100K</th><th>O-Class</th><th>Status</th>
    </tr></thead><tbody>`;
    results.forEach(r => {
      const passed = r.verdict === 'PASS' || r.verdict === 'O(1)';
      html += `<tr>
        <td>${r.structure || r.name || '--'}</td>
        <td>${r.operation || '--'}</td>
        <td>${r['100'] !== undefined ? r['100'] + 'ms' : r.n100 !== undefined ? r.n100 + 'ms' : '--'}</td>
        <td>${r['1000'] !== undefined ? r['1000'] + 'ms' : r.n1k !== undefined ? r.n1k + 'ms' : '--'}</td>
        <td>${r['10000'] !== undefined ? r['10000'] + 'ms' : r.n10k !== undefined ? r.n10k + 'ms' : '--'}</td>
        <td>${r['100000'] !== undefined ? r['100000'] + 'ms' : r.n100k !== undefined ? r.n100k + 'ms' : '--'}</td>
        <td>${r.complexity || r.o_class || '--'}</td>
        <td class="${passed ? 'o1-pass' : 'o1-fail'}">${passed ? '✅' : '❌'}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    contents.benchResults.innerHTML = html;
  } catch {
    contents.benchResults.innerHTML = '<p style="color:var(--loss)">Connection error</p>';
  }
}

// Event listeners
contents.refreshStocks.addEventListener('click', loadStocks);
contents.refreshTopk.addEventListener('click', loadTopK);
contents.bfsBtn.addEventListener('click', () => traverseGraph('bfs'));
contents.dfsBtn.addEventListener('click', () => traverseGraph('dfs'));
contents.createAlert.addEventListener('click', createAlert);
contents.undoAlert.addEventListener('click', undoAlert);
contents.runBenchmarks.addEventListener('click', runBenchmarks);

// Init
updateAuthUI();
checkHealth();
loadStocks();
