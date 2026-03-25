/* APAC Marketing Hub — app.js */

// ── Sheet tab names (must match your Google Sheet tab names exactly) ──
const SHEETS = {
  announcements: 'announcements',
  team: 'team',
  resources: 'resources',
  assets: 'assets',
  onboarding: 'onboarding',
  campaigns: 'campaigns',
  keyStats: 'key_stats',
  competitive: 'competitive',
  aiTools: 'ai_tools',
  brand: 'brand',
  comms: 'comms',
  insights: 'insights',
  okrs: 'okrs',
};

// ── Fetch CSV from a published Google Sheet ───────────────────────────
async function fetchSheet(sheetName) {
  if (!CONFIG.SHEET_ID || CONFIG.SHEET_ID === 'YOUR_GOOGLE_SHEET_ID_HERE') {
    return null;
  }
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    return parseCSV(text);
  } catch {
    return null;
  }
}

// ── Simple CSV parser ─────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
  return lines.slice(1).map(line => {
    const vals = splitCSVLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (vals[i] || '').replace(/^"|"$/g, '').trim();
    });
    return row;
  }).filter(r => Object.values(r).some(v => v));
}

function splitCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

// ── Tab navigation ────────────────────────────────────────────────────
function initNav() {
  // Tab links
  document.querySelectorAll('[data-tab]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      switchTab(el.dataset.tab);
    });
  });

  // Dropdown groups — toggle on button click
  document.querySelectorAll('.nav-group-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const group = btn.closest('.nav-group');
      const isOpen = group.classList.contains('open');
      document.querySelectorAll('.nav-group').forEach(g => g.classList.remove('open'));
      if (!isOpen) group.classList.add('open');
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-group').forEach(g => g.classList.remove('open'));
  });
}

function switchTab(tabId) {
  // Hide all
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  // Clear all active states
  document.querySelectorAll('[data-tab], .nav-group-btn').forEach(el => el.classList.remove('active'));

  // Show target
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');

  // Mark active nav links
  document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(el => el.classList.add('active'));

  // Mark parent group button active if it's a dropdown item
  const dropdownLink = document.querySelector(`.nav-dropdown [data-tab="${tabId}"]`);
  if (dropdownLink) {
    dropdownLink.closest('.nav-group')?.querySelector('.nav-group-btn')?.classList.add('active');
  }

  // Load tab data (once per session)
  loadTabData(tabId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Lazy data loading ─────────────────────────────────────────────────
const loadedTabs = new Set();

async function loadTabData(tabId) {
  if (loadedTabs.has(tabId)) return;
  loadedTabs.add(tabId);
  const loader = TAB_LOADERS[tabId];
  if (loader) await loader();
}

// ── Render helpers ────────────────────────────────────────────────────

function placeholder(icon, text, codeHint) {
  return `
    <div class="placeholder-card">
      <div class="ph-icon">${icon}</div>
      <p>${text}</p>
      ${codeHint ? `<code>${codeHint}</code>` : ''}
    </div>`;
}

function renderAnnouncements(data) {
  if (!data || data.length === 0) {
    return placeholder(
      '💬',
      'No announcements yet. Set up the Zapier automation (Slack → Google Sheet) and add rows to the <strong>announcements</strong> tab.',
      'Columns: timestamp, author, message, slack_link'
    );
  }
  return data.slice(0, 8).map(row => `
    <div class="announcement-card">
      <div class="announcement-meta">
        <div class="announcement-avatar">${(row.author || 'T').charAt(0).toUpperCase()}</div>
        <span class="announcement-author">${esc(row.author || 'Team')}</span>
        <span>${esc(row.timestamp || '')}</span>
      </div>
      <div class="announcement-text">${esc(row.message || '')}</div>
      ${row.slack_link ? `<a class="announcement-link" href="${esc(row.slack_link)}" target="_blank" rel="noopener">View in Slack →</a>` : ''}
    </div>`).join('');
}

function renderLinkCards(data, defaultIcon = '🔗') {
  if (!data || data.length === 0) {
    return placeholder('📋', 'No items yet. Add rows to the relevant Google Sheet tab.', 'Columns: title, url, description, icon (optional)');
  }
  return data.map(row => `
    <a class="link-card" href="${esc(row.url || '#')}" target="_blank" rel="noopener">
      <div class="link-card-icon" style="background: var(--green-light);">${row.icon || defaultIcon}</div>
      <div class="link-card-text">
        <div class="title">${esc(row.title || 'Untitled')}</div>
        ${row.description ? `<div class="desc">${esc(row.description)}</div>` : ''}
        ${row.category ? `<div class="desc">${esc(row.category)}</div>` : ''}
      </div>
      <div class="link-card-arrow">→</div>
    </a>`).join('');
}

function renderTeam(data) {
  if (!data || data.length === 0) {
    return placeholder('👥', 'Add team members to the <strong>team</strong> sheet tab.', 'Columns: name, role, photo_url, slack_handle');
  }
  return data.map(row => `
    <div class="card" style="text-align: center; padding: 24px;">
      <div style="width:60px;height:60px;border-radius:50%;background:var(--green);color:white;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;margin:0 auto 12px;overflow:hidden;">
        ${row.photo_url
          ? `<img src="${esc(row.photo_url)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='${(row.name || 'T').charAt(0).toUpperCase()}'">`
          : (row.name || 'T').charAt(0).toUpperCase()}
      </div>
      <div class="card-title">${esc(row.name || '')}</div>
      <div class="card-subtitle">${esc(row.role || '')}</div>
      ${row.slack_handle ? `<div style="margin-top:10px;"><a class="channel-chip" href="https://shopify.slack.com/team/${esc(row.slack_handle)}" target="_blank" rel="noopener"><span class="channel-chip-hash">@</span>${esc(row.slack_handle)}</a></div>` : ''}
    </div>`).join('');
}

function renderMetrics(data) {
  if (!data || data.length === 0) {
    return `
      <div class="metric-card"><div class="metric-label">GMV</div><div class="metric-value">—</div><div class="metric-delta neutral">Add rows to key_stats sheet</div></div>
      <div class="metric-card"><div class="metric-label">Pipeline</div><div class="metric-value">—</div><div class="metric-delta neutral">Add rows to key_stats sheet</div></div>
      <div class="metric-card"><div class="metric-label">SALs</div><div class="metric-value">—</div><div class="metric-delta neutral">Add rows to key_stats sheet</div></div>
      <div class="metric-card"><div class="metric-label">Events</div><div class="metric-value">—</div><div class="metric-delta neutral">Add rows to key_stats sheet</div></div>`;
  }
  return data.map(row => `
    <div class="metric-card">
      <div class="metric-label">${esc(row.label || '')}</div>
      <div class="metric-value">${esc(row.value || '—')}</div>
      ${row.delta ? `<div class="metric-delta ${esc(row.direction || 'neutral')}">${row.direction === 'up' ? '↑' : row.direction === 'down' ? '↓' : ''} ${esc(row.delta)}</div>` : ''}
    </div>`).join('');
}

function renderCampaigns(data) {
  if (!data || data.length === 0) {
    return placeholder('📅', 'Add campaigns to the <strong>campaigns</strong> sheet tab.', 'Columns: name, owner, start_date, end_date, status, brief_link');
  }
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Owner</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Brief</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td style="font-weight:600;">${esc(row.name || '')}</td>
              <td>${esc(row.owner || '')}</td>
              <td>${esc(row.start_date || '')}</td>
              <td>${esc(row.end_date || '')}</td>
              <td><span class="badge badge-${statusColor(row.status)}">${esc(row.status || '')}</span></td>
              <td>${row.brief_link ? `<a href="${esc(row.brief_link)}" target="_blank" rel="noopener" style="color:var(--green);font-weight:600;text-decoration:none;">View →</a>` : '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderDashboardEmbed(embedUrl, fallbackLinkUrl, fallbackText) {
  if (embedUrl) {
    return `<iframe class="dashboard-embed" src="${esc(embedUrl)}" allowfullscreen></iframe>`;
  }
  return `
    <div class="embed-placeholder">
      <div style="font-size:36px;">📊</div>
      <p>${fallbackText || 'Add a Looker Studio embed URL to <code>config.js</code>'}</p>
      ${fallbackLinkUrl ? `<a class="btn-primary" href="${esc(fallbackLinkUrl)}" target="_blank" rel="noopener" style="margin-top:14px;">Open in Looker Studio ↗</a>` : ''}
    </div>`;
}

function renderSlackChannels() {
  const el = document.getElementById('slack-channels-list');
  if (!el) return;
  el.innerHTML = (CONFIG.SLACK_CHANNELS || []).map(ch => `
    <a class="channel-chip" href="${esc(ch.url)}" target="_blank" rel="noopener">
      <span class="channel-chip-hash">#</span>${esc(ch.label || ch.name)}
    </a>`).join('');
}

// ── Status → badge color ──────────────────────────────────────────────
function statusColor(status) {
  const s = (status || '').toLowerCase();
  if (['live', 'active', 'complete', 'done'].includes(s)) return 'green';
  if (['planned', 'upcoming', 'in progress'].includes(s)) return 'blue';
  if (['draft'].includes(s)) return 'yellow';
  if (['paused', 'cancelled'].includes(s)) return 'red';
  return 'gray';
}

// ── HTML escape ───────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Tab data loaders ──────────────────────────────────────────────────
const TAB_LOADERS = {

  home: async () => {
    renderSlackChannels();

    const slackLink = document.getElementById('slack-channel-link');
    if (slackLink && CONFIG.ANNOUNCEMENTS_CHANNEL_URL) {
      slackLink.href = CONFIG.ANNOUNCEMENTS_CHANNEL_URL;
    }

    const orgCard = document.getElementById('org-chart-link');
    if (orgCard && CONFIG.LINKS?.orgChart) {
      orgCard.href = CONFIG.LINKS.orgChart;
    }

    const data = await fetchSheet(SHEETS.announcements);
    const feedEl = document.getElementById('announcements-feed');
    if (feedEl) feedEl.innerHTML = renderAnnouncements(data);
  },

  'key-stats': async () => {
    const data = await fetchSheet(SHEETS.keyStats);
    const el = document.getElementById('key-stats-grid');
    if (el) el.innerHTML = renderMetrics(data);

    const embedEl = document.getElementById('stats-dashboard-embed');
    if (embedEl) {
      embedEl.outerHTML = renderDashboardEmbed(
        CONFIG.DASHBOARDS?.keyStats,
        '',
        'Add your Looker Studio embed URL to <code>config.js</code> → <code>DASHBOARDS.keyStats</code>'
      );
    }
  },

  'performance-dashboard': async () => {
    const linkEl = document.getElementById('perf-dashboard-link');
    if (linkEl && CONFIG.DASHBOARDS?.performance) {
      linkEl.href = CONFIG.DASHBOARDS.performance;
    }
    const embedEl = document.getElementById('perf-dashboard-embed');
    if (embedEl) {
      embedEl.outerHTML = renderDashboardEmbed(
        CONFIG.DASHBOARDS?.performance,
        CONFIG.DASHBOARDS?.performance,
        'Add your Looker Studio embed URL to <code>config.js</code> → <code>DASHBOARDS.performance</code>'
      );
    }
  },

  'campaign-deep-dive': async () => {
    const data = await fetchSheet(SHEETS.campaigns);
    const el = document.getElementById('campaigns-table');
    if (el) el.innerHTML = renderCampaigns(data);
  },

  'mkt-insights': async () => {
    const data = await fetchSheet(SHEETS.competitive);
    const el = document.getElementById('competitive-grid');
    if (el) el.innerHTML = renderLinkCards(data, '🔍');
  },

  'account-insights': async () => {
    const data = await fetchSheet(SHEETS.resources);
    const filtered = data ? data.filter(r => !r.category || r.category.toLowerCase().includes('account')) : null;
    const el = document.getElementById('account-links');
    if (el) el.innerHTML = renderLinkCards(filtered && filtered.length ? filtered : data, '🏢');
  },

  'tactic-tracker': async () => {
    const data = await fetchSheet(SHEETS.campaigns);
    const el = document.getElementById('tracker-campaigns');
    if (el) el.innerHTML = renderCampaigns(data);
  },

  'hub-okrs': async () => {
    const data = await fetchSheet(SHEETS.okrs);
    const el = document.getElementById('okrs-grid');
    if (el) el.innerHTML = renderLinkCards(data, '🎯');
    else {
      const fallback = document.getElementById('okrs-grid');
      if (fallback) fallback.innerHTML = placeholder('🎯', 'Add OKR links to the <strong>okrs</strong> sheet tab.', 'Columns: title, url, description');
    }
  },

  'content-repo': async () => {
    const data = await fetchSheet(SHEETS.assets);
    const el = document.getElementById('assets-grid');
    if (el) {
      const render = (rows) => el.innerHTML = renderLinkCards(rows, '📄');
      render(data);

      // Wire up search + filter
      const searchEl = document.getElementById('assets-search');
      const typeEl = document.getElementById('assets-type-filter');
      const filter = () => {
        const q = (searchEl?.value || '').toLowerCase();
        const type = (typeEl?.value || '').toLowerCase();
        const filtered = (data || []).filter(r =>
          (!q || (r.title || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)) &&
          (!type || (r.type || '').toLowerCase().includes(type))
        );
        render(filtered);
      };
      searchEl?.addEventListener('input', filter);
      typeEl?.addEventListener('change', filter);
    }
  },

  'self-serve': async () => {
    const data = await fetchSheet(SHEETS.onboarding);
    const el = document.getElementById('guides-grid');
    if (el) el.innerHTML = renderLinkCards(data, '📖');
  },

  'comms-pr': async () => {
    const data = await fetchSheet(SHEETS.comms);
    const el = document.getElementById('comms-grid');
    if (el) el.innerHTML = renderLinkCards(data, '📰');
  },

  'insights': async () => {
    const data = await fetchSheet(SHEETS.insights);
    const el = document.getElementById('insights-grid');
    if (el) el.innerHTML = renderLinkCards(data, '📊');
  },

  'ai-tools': async () => {
    const data = await fetchSheet(SHEETS.aiTools);
    const el = document.getElementById('ai-tools-grid');
    if (el) el.innerHTML = renderLinkCards(data, '🤖');
  },

  'brand-champion': async () => {
    const data = await fetchSheet(SHEETS.brand);
    const el = document.getElementById('brand-grid');
    if (el) el.innerHTML = renderLinkCards(data, '✨');
  },
};

// ── Init ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();

  // Set today's date in the welcome banner
  const dateEl = document.getElementById('today-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-AU', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  // Load home tab data on init
  loadTabData('home');

  // Handle URL hash on load (e.g. apacmarketinghub/#key-stats)
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    switchTab(hash);
  }
});
