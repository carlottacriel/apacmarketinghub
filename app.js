/* APAC Marketing Hub — app.js */

// ── Sheet tab names — must match the tabs in the master Google Sheet ──
const SHEETS = {
  orgChart:      'Org Chart',
  tactics:       'tactics',
  announcements: 'announcements',
  team:          'team',
  keyStats:      'key_stats',
  campaigns:     'campaigns',
  competitive:   'competitive',
  resources:     'resources',
  okrs:          'okrs',
  assets:        'assets',
  onboarding:    'onboarding',
  comms:         'comms',
  insights:      'insights',
  aiTools:       'ai_tools',
  brand:         'brand',
};

// ── Fetch from Apps Script (live, real-time) ──────────────────────────
async function fetchFromScript(action, sheet) {
  const base = CONFIG.APPS_SCRIPT_URL;
  if (!base || base === 'YOUR_APPS_SCRIPT_URL_HERE') return null;
  try {
    let url = `${base}?action=${action}`;
    if (sheet) url += `&sheet=${encodeURIComponent(sheet)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.ok) return null;
    // ?action=cms&sheet=X returns { data: { sheetName, rows } }
    // ?action=tactics returns { data: { sheetName, rows } }
    return json.data?.rows ?? json.data ?? null;
  } catch {
    return null;
  }
}

// ── Fetch sheet data — Apps Script first, CSV fallback ───────────────
async function fetchSheet(sheetName) {
  // Try Apps Script first (real-time, no publishing needed)
  const scriptData = await fetchFromScript('cms', sheetName);
  if (scriptData) return scriptData;

  // Fallback: published CSV (requires File → Share → Publish to web)
  if (!CONFIG.MASTER_SHEET_ID || CONFIG.MASTER_SHEET_ID === 'YOUR_MASTER_SHEET_ID_HERE') return null;
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.MASTER_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    if (text.startsWith('<')) return null;
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
  document.querySelectorAll('[data-tab]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      switchTab(el.dataset.tab);
    });
  });
}

// ── Section index (powers global search) ─────────────────────────────
const SECTIONS = [
  { id: 'org-chart',            title: 'Org Chart',                      desc: 'APAC team structure & contacts',           icon: '👥' },
  { id: 'account-insights',     title: 'Account Insights',               desc: 'Key accounts & territory links',           icon: '🏢' },
  { id: 'tactic-tracker',       title: 'Calendar',                       desc: 'Live APAC marketing calendar',             icon: '🗓️' },
  { id: 'hub-okrs',             title: 'Mktg Strategy + OKRs',           desc: 'OKR progress & planning docs',             icon: '🎯' },
  { id: 'content-repo',         title: 'Content Repository',             desc: 'Decks, templates & assets',               icon: '📁' },
  { id: 'brand-champion',       title: 'Be a Brand Champion',            desc: 'Guidelines, logos & tone of voice',        icon: '✨' },
  { id: 'self-serve',           title: 'Self Serve Guides',              desc: 'How-to docs & onboarding',                icon: '📖' },
  { id: 'comms-pr',             title: 'Comms + PR',                     desc: 'Press resources & media contacts',         icon: '📰' },
  { id: 'key-stats',            title: 'Key Stats',                      desc: 'Headline APAC metrics',                    icon: '📊' },
  { id: 'performance-dashboard',title: 'Performance Dashboard',           desc: 'Looker Studio dashboard links',            icon: '📈' },
  { id: 'campaign-deep-dive',   title: 'Campaign Deep Dive',             desc: 'Campaign-level breakdown',                 icon: '🔬' },
  { id: 'mkt-insights',         title: 'Market Insights + Competitor',   desc: 'Market intel & competitor landscape',      icon: '🔍' },
  { id: 'ai-tools',             title: 'Useful Agents + Tools',          desc: 'Internal AI tools & Cursor agents',        icon: '🤖' },
];

// ── Global search ─────────────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('header-search');
  const dropdown = document.getElementById('header-search-dropdown');
  if (!input || !dropdown) return;

  function renderResults(q) {
    if (!q) { dropdown.style.display = 'none'; return; }
    const matches = SECTIONS.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q)
    );
    if (!matches.length) {
      dropdown.innerHTML = '<div class="search-no-results">No sections found</div>';
    } else {
      dropdown.innerHTML = matches.map(s => `
        <div class="search-result" data-tab="${s.id}">
          <span class="search-result-icon">${s.icon}</span>
          <div class="search-result-text">
            <div class="search-result-title">${s.title}</div>
            <div class="search-result-group">${s.desc}</div>
          </div>
        </div>
      `).join('');
      dropdown.querySelectorAll('.search-result').forEach(el => {
        el.addEventListener('click', () => {
          switchTab(el.dataset.tab);
          input.value = '';
          dropdown.style.display = 'none';
        });
      });
    }
    dropdown.style.display = 'block';
  }

  input.addEventListener('input', () => renderResults(input.value.trim().toLowerCase()));

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { dropdown.style.display = 'none'; input.blur(); }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#header-search-wrap')) dropdown.style.display = 'none';
  });
}

function switchTab(tabId, pushState = true) {
  // If leaving the tracker tab, park the iframe on about:blank so it stops rendering,
  // and remove it from loadedTabs so the src is re-injected next visit.
  if (tabId !== 'tactic-tracker') {
    const iframe = document.getElementById('tracker-iframe');
    if (iframe && iframe.dataset.src && iframe.src !== 'about:blank' && iframe.src !== '') {
      iframe.src = 'about:blank';
      loadedTabs.delete('tactic-tracker');
    }
  }
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('[data-tab]').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(el => el.classList.add('active'));

  if (pushState) {
    const hash = tabId === 'home' ? '' : '#' + tabId;
    history.pushState({ tab: tabId }, '', location.pathname + hash);
  }

  loadTabData(tabId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('popstate', e => {
  const tab = (e.state && e.state.tab) || (location.hash ? location.hash.replace('#', '') : 'home');
  switchTab(tab, false);
});

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
      'No announcements yet.',
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
    return placeholder('📋', 'No items yet.');
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

function renderOKRTiles(data) {
  if (!data || data.length === 0) {
    return placeholder('🎯', 'No OKR docs yet.');
  }
  return data.map(row => {
    const keys = Object.keys(row);
    const name  = row[keys[0]] || 'Untitled';
    const link  = row[keys[1]] || '#';
    const owner = row[keys[2]] || '';
    return `
      <a class="doc-tile-card" href="${esc(link)}" target="_blank" rel="noopener">
        <div class="doc-tile-card-icon">📋</div>
        <div class="doc-tile-card-title">${esc(name)}</div>
        ${owner ? `<div class="doc-tile-card-sub">Owner: ${esc(owner)}</div>` : ''}
      </a>`;
  }).join('');
}

function renderTeam(data) {
  if (!data || data.length === 0) {
    return placeholder('👥', 'No team members found.');
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
      <div class="metric-card"><div class="metric-label">GMV</div><div class="metric-value">—</div><div class="metric-delta neutral">—</div></div>
      <div class="metric-card"><div class="metric-label">Pipeline</div><div class="metric-value">—</div><div class="metric-delta neutral">—</div></div>
      <div class="metric-card"><div class="metric-label">SALs</div><div class="metric-value">—</div><div class="metric-delta neutral">—</div></div>
      <div class="metric-card"><div class="metric-label">Events</div><div class="metric-value">—</div><div class="metric-delta neutral">—</div></div>`;
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
    return placeholder('📅', 'No campaigns yet.');
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

// ── Org chart renderer ────────────────────────────────────────────────
function renderOrgChart(data) {
  if (!data || !data.length) {
    return placeholder('👥', 'No team members yet.', 'Add entries to the ORG_CHART array in config.js.');
  }

  function makeCard(p) {
    const name      = p.name     || p['Name']         || '';
    const title     = p.title    || p['Title']        || '';
    const photo     = p.photo    || p['Photo URL']    || '';
    const slack     = p.slack    || p['Slack Handle'] || '';
    const desc      = p.desc     || p['Description']  || '';
    const vaultUrl  = p.vault    || p['Vault URL']    || '';
    const category  = p.category || p['Category']     || '';

    // Skip placeholder leader entries
    if (name === 'Leader Name') return '';

    const initial    = (name || '?').charAt(0).toUpperCase();
    const slackId    = slack.replace(/^@/, '');
    const cleanSlack = slackId ? `@${slackId}` : '';
    const slackHref  = slackId ? `https://shopify.slack.com/team/${slackId}` : '#';

    const avatarInner = photo
      ? `<img src="${esc(photo)}" alt="${esc(name)}" onerror="this.style.display='none';this.parentElement.dataset.initial='${initial}';this.parentElement.textContent='${initial}'">`
      : initial;

    const nameEl = vaultUrl
      ? `<a class="org-name" href="${esc(vaultUrl)}" target="_blank" rel="noopener">${esc(name)}</a>`
      : `<div class="org-name--plain">${esc(name)}</div>`;

    const slackEl = cleanSlack
      ? `<a class="org-slack" href="${esc(slackHref)}" target="_blank" rel="noopener">${esc(cleanSlack)}</a>`
      : '';

    const descEl = desc ? `<div class="org-desc">${esc(desc)}</div>` : '';
    const isLeader = category === 'Leaders';

    return `
      <div class="org-card${isLeader ? ' org-card--leader' : ''}">
        <div class="org-avatar">${avatarInner}</div>
        ${nameEl}
        <div class="org-title">${esc(title)}</div>
        ${slackEl}
        ${descEl}
      </div>`;
  }

  // ── Group by Region, then by Category within each region ────────────────
  const REGION_ORDER    = ['APAC', 'ANZ', 'ANZ & ROA', 'Japan', 'GCR', 'India', 'Southeast Asia', 'ROA'];
  const REGION_FLAGS    = { 'APAC': '🌏', 'ANZ': '🇦🇺', 'ANZ & ROA': '🇦🇺', 'Japan': '🇯🇵', 'GCR': '🇨🇳', 'India': '🇮🇳', 'Southeast Asia': '🌴', 'ROA': '🌐' };
  const CATEGORY_ORDER  = ['Leaders', 'Brand & Content', 'Programs + Distribution', 'Events', 'Partner Marketing'];

  const getField = (p, cap, low) => p[cap] || p[low] || '';

  // Separate leaders (shown first, above region sections)
  const leaders    = data.filter(p => getField(p, 'Category', 'category') === 'Leaders');
  const nonLeaders = data.filter(p => getField(p, 'Category', 'category') !== 'Leaders');

  // Group non-leaders by region
  const byRegion = {};
  nonLeaders.forEach(p => {
    const region = getField(p, 'Region', 'region') || 'APAC';
    if (!byRegion[region]) byRegion[region] = {};
    const cat = getField(p, 'Category', 'category') || 'Other';
    if (!byRegion[region][cat]) byRegion[region][cat] = [];
    byRegion[region][cat].push(p);
  });

  // Discover any regions not in our predefined order
  Object.keys(byRegion).forEach(r => { if (!REGION_ORDER.includes(r)) REGION_ORDER.push(r); });

  let html = '';

  // Leaders row — same grid width as region pairs below
  if (leaders.length) {
    const leaderCards = leaders.map(makeCard).join('');
    if (leaderCards.trim()) {
      html += `
        <div class="org-section org-section--leaders">
          <div class="org-section-label"><span>⭐ Leadership</span></div>
          <div class="org-grid--leaders">${leaderCards}</div>
        </div>`;
    }
  }

  // Region sections — all members in a flat row, no category splitting
  REGION_ORDER.forEach(region => {
    const catMap = byRegion[region];
    if (!catMap) return;

    const flag = REGION_FLAGS[region] || '🌐';

    // Flatten all members in category order
    const allMembers = [];
    CATEGORY_ORDER.forEach(cat => {
      if (catMap[cat]) allMembers.push(...catMap[cat]);
    });
    Object.keys(catMap).forEach(cat => {
      if (!CATEGORY_ORDER.includes(cat)) allMembers.push(...catMap[cat]);
    });

    if (!allMembers.length) return;

    const cards = allMembers.map(makeCard).join('');
    if (!cards.trim()) return;

    html += `
      <div class="org-section">
        <div class="org-section-label"><span>${flag} ${region}</span></div>
        <div class="org-grid org-grid--region">${cards}</div>
      </div>`;
  });

  return html || placeholder('👥', 'No team members yet.', '');
}

// ── Tab data loaders ──────────────────────────────────────────────────
const TAB_LOADERS = {

  home: async () => {
    const orgLink = document.getElementById('org-chart-link');
    if (orgLink && CONFIG.LINKS?.orgChart && CONFIG.LINKS.orgChart !== 'YOUR_ORG_CHART_URL_HERE') {
      orgLink.href = CONFIG.LINKS.orgChart;
    }

    // Calendar home card navigates to tactic-tracker tab (not an external link)
    const calCard = document.querySelector('.home-card--cal');
    if (calCard) {
      calCard.addEventListener('click', e => {
        e.preventDefault();
        switchTab('tactic-tracker');
      });
    }

    const hotEl = document.getElementById('hot-items');
    if (hotEl && CONFIG.HOT_THIS_WEEK?.length) {
      hotEl.innerHTML = CONFIG.HOT_THIS_WEEK.map(item => {
        const tag = item.link ? 'a' : 'div';
        const attrs = item.link ? `href="${esc(item.link)}" target="_blank" rel="noopener"` : '';
        return `<${tag} class="hot-item${item.link ? ' hot-item--linked' : ''}" ${attrs}>
          <div class="hot-item-emoji">${item.emoji || '🔥'}</div>
          <div>
            <div class="hot-item-title">${esc(item.title || '')}</div>
            <div class="hot-item-desc">${esc(item.desc || '')}</div>
          </div>
        </${tag}>`;
      }).join('');
    }
  },

  'org-chart': async () => {
    const el = document.getElementById('org-grid');
    if (!el) return;

    el.innerHTML = '<div class="loading">Loading team…</div>';

    // 1. Try live Apps Script endpoint (source of truth = Google Sheet)
    if (CONFIG.APPS_SCRIPT_URL) {
      try {
        const res  = await fetch(CONFIG.APPS_SCRIPT_URL + '?action=orgchart');
        const json = await res.json();
        if (json.ok && json.data && json.data.rows && json.data.rows.length) {
          el.innerHTML = renderOrgChart(json.data.rows);
          return;
        }
      } catch (e) {
        console.warn('Apps Script fetch failed, falling back to config.js', e);
      }
    }

    // 2. Fallback: use hardcoded data from config.js
    if (CONFIG.ORG_CHART && CONFIG.ORG_CHART.length) {
      el.innerHTML = renderOrgChart(CONFIG.ORG_CHART);
      return;
    }

    el.innerHTML = '<div class="loading">No team data found. Paste your Apps Script URL into CONFIG.APPS_SCRIPT_URL in config.js.</div>';
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
    // Lazy-load the iframe — only set src when this tab is actually opened
    const iframe = document.getElementById('tracker-iframe');
    const fallback = document.getElementById('tracker-fallback');
    const notLoaded = !iframe.src || iframe.src === 'about:blank' || iframe.src === window.location.href;
    if (iframe && notLoaded && iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
      iframe.addEventListener('load', function onLoad() {
        iframe.removeEventListener('load', onLoad);
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          if (!doc || doc.URL === 'about:blank') fallback.style.display = 'flex';
        } catch(e) {
          fallback.style.display = 'flex';
        }
      }, { once: true });
    }
  },

  'hub-okrs': async () => {
    const data = await fetchSheet(SHEETS.okrs);
    const el = document.getElementById('okrs-grid');
    if (el) el.innerHTML = renderOKRTiles(data);
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

// ── Calendar engine ───────────────────────────────────────────────────

const CAL_COLORS = [
  { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' }, // green
  { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' }, // blue
  { bg: '#FEF9C3', text: '#854D0E', border: '#FDE047' }, // yellow
  { bg: '#FCE7F3', text: '#9D174D', border: '#F9A8D4' }, // pink
  { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' }, // indigo
  { bg: '#FFEDD5', text: '#9A3412', border: '#FDBA74' }, // orange
  { bg: '#F3E8FF', text: '#6B21A8', border: '#D8B4FE' }, // purple
  { bg: '#CCFBF1', text: '#134E4A', border: '#5EEAD4' }, // teal
];

const colorMap = {};
let colorIndex = 0;

function getColor(key) {
  if (!colorMap[key]) {
    colorMap[key] = CAL_COLORS[colorIndex % CAL_COLORS.length];
    colorIndex++;
  }
  return colorMap[key];
}

// Column mapping — reads from CONFIG.TACTIC_COLUMNS or falls back to common names
function col(row, ...aliases) {
  const cols = CONFIG.TACTIC_COLUMNS || {};
  for (const alias of aliases) {
    const mapped = cols[alias];
    if (mapped && row[mapped] !== undefined) return row[mapped] || '';
    if (row[alias] !== undefined) return row[alias] || '';
  }
  // Try case-insensitive match
  const keys = Object.keys(row);
  for (const alias of aliases) {
    const found = keys.find(k => k.toLowerCase().replace(/[^a-z]/g, '') === alias.toLowerCase().replace(/[^a-z]/g, ''));
    if (found) return row[found] || '';
  }
  return '';
}

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

let calState = {
  allData: [],
  filtered: [],
  year: new Date().getFullYear(),
  month: new Date().getMonth(), // 0-indexed
};

function initCalendar(data) {
  const wrap = document.getElementById('cal-wrap');
  if (!wrap) return;

  if (!data || data.length === 0) {
    wrap.innerHTML = `
      <div class="cal-empty">
        <div class="ph-icon">📅</div>
        <p>View all APAC marketing activities in the full tracker.</p>
        <a class="btn-primary" href="https://apac-marketing-tracker.quick.shopify.io/" target="_blank" rel="noopener" style="margin-top:14px; display:inline-flex;">
          Open APAC Marketing Tracker ↗
        </a>
      </div>`;
    return;
  }

  calState.allData = data;
  calState.filtered = data;

  populateFilters(data);
  bindCalendarEvents();
  renderCalendar();
}

function populateFilters(data) {
  const filterDefs = [
    { id: 'cal-filter-market', keys: ['market', 'region', 'Market', 'Region'] },
    { id: 'cal-filter-type',   keys: ['type', 'channel', 'Type', 'Channel', 'tactic_type'] },
    { id: 'cal-filter-owner',  keys: ['owner', 'dri', 'Owner', 'DRI', 'lead'] },
    { id: 'cal-filter-status', keys: ['status', 'Status', 'state'] },
  ];

  filterDefs.forEach(({ id, keys }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const values = [...new Set(data.map(r => col(r, ...keys)).filter(Boolean))].sort();
    if (values.length === 0) { el.style.display = 'none'; return; }
    values.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      el.appendChild(opt);
    });
  });

  // Build legend by type
  renderLegend(data);
}

function renderLegend(data) {
  const el = document.getElementById('cal-legend');
  if (!el) return;
  const types = [...new Set(data.map(r => col(r, 'type', 'channel', 'Type', 'Channel', 'tactic_type')).filter(Boolean))];
  el.innerHTML = types.slice(0, 6).map(t => {
    const c = getColor(t);
    return `<div class="cal-legend-item">
      <div class="cal-legend-dot" style="background:${c.bg};border:1.5px solid ${c.border};"></div>
      ${esc(t)}
    </div>`;
  }).join('');
}

function bindCalendarEvents() {
  document.getElementById('cal-prev')?.addEventListener('click', () => {
    calState.month--;
    if (calState.month < 0) { calState.month = 11; calState.year--; }
    renderCalendar();
  });

  document.getElementById('cal-next')?.addEventListener('click', () => {
    calState.month++;
    if (calState.month > 11) { calState.month = 0; calState.year++; }
    renderCalendar();
  });

  document.getElementById('cal-today')?.addEventListener('click', () => {
    calState.month = new Date().getMonth();
    calState.year = new Date().getFullYear();
    renderCalendar();
  });

  // Filters
  ['cal-search', 'cal-filter-market', 'cal-filter-type', 'cal-filter-owner', 'cal-filter-status'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', applyFilters);
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });

  document.getElementById('cal-clear-filters')?.addEventListener('click', () => {
    document.getElementById('cal-search').value = '';
    ['cal-filter-market','cal-filter-type','cal-filter-owner','cal-filter-status'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    applyFilters();
  });

  // Modal close
  document.getElementById('cal-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('cal-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('cal-modal')) closeModal();
  });
}

function applyFilters() {
  const q = (document.getElementById('cal-search')?.value || '').toLowerCase();
  const market = document.getElementById('cal-filter-market')?.value || '';
  const type   = document.getElementById('cal-filter-type')?.value || '';
  const owner  = document.getElementById('cal-filter-owner')?.value || '';
  const status = document.getElementById('cal-filter-status')?.value || '';

  calState.filtered = calState.allData.filter(r => {
    const name = (col(r, 'name', 'tactic', 'campaign', 'title') + ' ' + col(r, 'description')).toLowerCase();
    if (q && !name.includes(q)) return false;
    if (market && col(r, 'market', 'region', 'Market', 'Region') !== market) return false;
    if (type   && col(r, 'type', 'channel', 'Type', 'Channel', 'tactic_type') !== type) return false;
    if (owner  && col(r, 'owner', 'dri', 'Owner', 'DRI', 'lead') !== owner) return false;
    if (status && col(r, 'status', 'Status', 'state') !== status) return false;
    return true;
  });

  const hasFilters = q || market || type || owner || status;
  const clearBtn = document.getElementById('cal-clear-filters');
  if (clearBtn) clearBtn.style.display = hasFilters ? 'block' : 'none';

  renderCalendar();
}

function renderCalendar() {
  const { year, month, filtered } = calState;
  const wrap = document.getElementById('cal-wrap');
  if (!wrap) return;

  const label = document.getElementById('cal-month-label');
  if (label) {
    label.textContent = new Date(year, month, 1).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  }

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
  const today = new Date();

  // Cells: pad start + all days + pad end to complete last row
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  // Filter tactics visible in this month
  const monthTactics = filtered.filter(r => {
    const start = parseDate(col(r, 'start_date', 'start', 'Start Date', 'StartDate'));
    const end   = parseDate(col(r, 'end_date', 'end', 'End Date', 'EndDate'));
    if (!start && !end) return false;
    const s = start || end;
    const e = end || start;
    return s <= lastDay && e >= firstDay;
  });

  let html = `
    <div class="cal-day-headers">
      ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `<div class="cal-day-header">${d}</div>`).join('')}
    </div>
    <div class="cal-grid">`;

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    const isCurrentMonth = dayNum >= 1 && dayNum <= lastDay.getDate();
    const cellDate = new Date(year, month, dayNum);
    const isToday = isCurrentMonth &&
      cellDate.getDate() === today.getDate() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getFullYear() === today.getFullYear();

    const classes = ['cal-cell'];
    if (!isCurrentMonth) classes.push('other-month');
    if (isToday) classes.push('today');

    // Tactics starting on this day
    const dayTactics = monthTactics.filter(r => {
      const start = parseDate(col(r, 'start_date', 'start', 'Start Date', 'StartDate'));
      return start && start.toDateString() === cellDate.toDateString();
    });

    // Tactics that span into this day (started before, still running)
    const spanningTactics = monthTactics.filter(r => {
      const start = parseDate(col(r, 'start_date', 'start', 'Start Date', 'StartDate'));
      const end   = parseDate(col(r, 'end_date', 'end', 'End Date', 'EndDate'));
      return start && end && start < cellDate && end >= cellDate;
    });

    const allDayTactics = [...dayTactics, ...spanningTactics].slice(0, 3);
    const overflow = [...dayTactics, ...spanningTactics].length - 3;

    html += `<div class="${classes.join(' ')}">
      <div class="cal-date-num">${isCurrentMonth ? dayNum : ''}</div>`;

    allDayTactics.forEach(r => {
      const name = col(r, 'name', 'tactic', 'campaign', 'title') || 'Untitled';
      const type = col(r, 'type', 'channel', 'Type', 'Channel', 'tactic_type');
      const c = getColor(type || 'default');
      const idx = calState.allData.indexOf(r);
      html += `<div class="cal-tactic" 
        style="background:${c.bg};color:${c.text};border-left:2px solid ${c.border};"
        onclick="openTacticModal(${idx})"
        title="${esc(name)}">${esc(name)}</div>`;
    });

    if (overflow > 0) html += `<div class="cal-more">+${overflow} more</div>`;
    html += `</div>`;
  }

  html += `</div>`;

  if (monthTactics.length === 0 && filtered.length > 0) {
    html = `<div class="cal-empty"><div class="ph-icon">📅</div><p>No tactics in this month. Try navigating to another month or clearing filters.</p></div>`;
  } else if (filtered.length === 0) {
    html = `<div class="cal-empty"><div class="ph-icon">🔍</div><p>No tactics match your filters. <button class="btn-clear-filters" onclick="document.getElementById('cal-clear-filters').click()" style="display:inline;">Clear filters</button></p></div>`;
  }

  wrap.innerHTML = html;
}

function openTacticModal(idx) {
  const r = calState.allData[idx];
  if (!r) return;

  const name    = col(r, 'name', 'tactic', 'campaign', 'title') || 'Untitled';
  const type    = col(r, 'type', 'channel', 'Type', 'Channel', 'tactic_type');
  const market  = col(r, 'market', 'region', 'Market', 'Region');
  const owner   = col(r, 'owner', 'dri', 'Owner', 'DRI', 'lead');
  const start   = col(r, 'start_date', 'start', 'Start Date', 'StartDate');
  const end     = col(r, 'end_date', 'end', 'End Date', 'EndDate');
  const status  = col(r, 'status', 'Status', 'state');
  const brief   = col(r, 'brief_link', 'brief', 'link', 'Brief Link');
  const desc    = col(r, 'description', 'notes', 'Description', 'Notes');
  const c       = getColor(type || 'default');

  const rows = [
    type   && { label: 'Type',   value: type },
    market && { label: 'Market', value: market },
    owner  && { label: 'Owner',  value: owner },
    (start || end) && { label: 'Dates', value: [start, end].filter(Boolean).join(' → ') },
    status && { label: 'Status', value: `<span class="badge badge-${statusColor(status)}">${esc(status)}</span>` },
    desc   && { label: 'Notes',  value: esc(desc) },
  ].filter(Boolean);

  document.getElementById('cal-modal-body').innerHTML = `
    <div class="cal-modal-type-badge" style="background:${c.bg};color:${c.text};">${esc(type || 'Tactic')}</div>
    <div class="cal-modal-title">${esc(name)}</div>
    <div class="cal-modal-meta">
      ${rows.map(row => `
        <div class="cal-modal-row">
          <div class="cal-modal-row-label">${row.label}</div>
          <div class="cal-modal-row-value">${row.value}</div>
        </div>`).join('')}
    </div>
    ${brief ? `<div class="cal-modal-actions">
      <a class="btn-primary" href="${esc(brief)}" target="_blank" rel="noopener">View Brief ↗</a>
    </div>` : ''}`;

  document.getElementById('cal-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('cal-modal').style.display = 'none';
}

// Make openTacticModal available globally (called from inline onclick)
window.openTacticModal = openTacticModal;

// ── Init ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSearch();

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
