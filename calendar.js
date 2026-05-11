/* APAC Marketing Calendar — month grid + list view */
(function () {
  const STATUS_COLORS = {
    '🏁 Complete':   { bg: '#e8f5ee', fg: '#1f7a3f', dot: '#2ea05a' },
    '✅ Confirmed':  { bg: '#e6f0ff', fg: '#1d4ed8', dot: '#3b82f6' },
    '🔁 In Progress':{ bg: '#fff4e0', fg: '#a85a00', dot: '#f59e0b' },
    '🔄 Planning':   { bg: '#f0e8ff', fg: '#6b21a8', dot: '#9333ea' },
    '⏳ TBD':        { bg: '#f1f3f5', fg: '#5b6573', dot: '#94a3b8' },
  };
  const DEFAULT_COLOR = { bg: '#eef0f2', fg: '#475569', dot: '#64748b' };

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const WEEKDAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  // Collapse legacy country labels into canonical ones.
  const COUNTRY_NORMALIZE = {
    '🇦🇺 AU': '🇦🇺 ANZ',
    '🇳🇿 NZ': '🇦🇺 ANZ',
    '🇦🇺 APAC (ANZ + SG)': '🇦🇺 ANZ',
    'AU': '🇦🇺 ANZ',
    'NZ': '🇦🇺 ANZ',
    'APAC (ANZ + SG)': '🇦🇺 ANZ',
  };

  let state = {
    view: 'grid',        // 'grid' | 'list'
    cursor: null,        // Date — first of currently displayed month (grid view)
    filters: { country: 'All', status: 'All', channels: [], owner: 'All', q: '' },
    selected: null,      // selected event id
  };

  let allEvents = [];

  // ── Date parsing — sheet uses M/D/YYYY; also handles "M/?" (TBD day) ──
  // Returns { date, approx } or null
  function parseDate(s) {
    if (!s) return null;
    const str = String(s).trim();
    let m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return { date: new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2])), approx: false };
    m = str.match(/^(\d{1,2})\/\?(?:\/(\d{4}))?$/);
    if (m) {
      const year = m[2] ? parseInt(m[2]) : new Date().getFullYear();
      return { date: new Date(year, parseInt(m[1]) - 1, 1), approx: true };
    }
    return null;
  }

  function fmtDateShort(d) {
    if (!d) return '';
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  }
  function fmtDateLong(d) {
    if (!d) return '';
    return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }

  // ── Normalize events ────────────────────────────────────────────────
  function normalize(raw) {
    return raw.map(e => {
      const s = parseDate(e.start);
      const en = parseDate(e.end);
      if (!s) return null;
      const country = COUNTRY_NORMALIZE[e.country] || e.country;
      return { ...e, country, _start: s.date, _end: (en?.date) || s.date, _approx: s.approx };
    }).filter(Boolean);
  }

  function unique(arr) {
    return Array.from(new Set(arr.filter(Boolean)))
      .filter(v => v && v.length > 1)  // drop single-char typos like "s"
      .sort();
  }

  // ── Filter ──────────────────────────────────────────────────────────
  function applyFilters(events) {
    const f = state.filters;
    const q = f.q.toLowerCase();
    return events.filter(e => {
      if (f.country !== 'All' && e.country !== f.country) return false;
      if (f.status !== 'All' && e.status !== f.status) return false;
      if (f.channels.length > 0 && !f.channels.includes(e.channel)) return false;
      if (f.owner !== 'All' && e.owner !== f.owner) return false;
      if (q) {
        const hay = (e.name + ' ' + e.owner + ' ' + e.partner + ' ' + e.publication + ' ' + e.notes + ' ' + e.location).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  // ── Render: filter bar ──────────────────────────────────────────────
  function renderFilterBar(events) {
    const countries = ['All', ...unique(events.map(e => e.country))];
    const statuses  = ['All', ...unique(events.map(e => e.status))];
    const channels  = ['All', ...unique(events.map(e => e.channel))];
    const owners    = ['All', ...unique(events.map(e => e.owner))];

    return `
      <div class="cal-filters">
        <div class="cal-filter-row">
          <div class="cal-search">
            <input type="text" id="cal-search" placeholder="Search events, owners, partners…" value="${escapeAttr(state.filters.q)}" />
          </div>
          <div class="cal-view-toggle">
            <button class="cal-view-btn ${state.view === 'grid' ? 'active' : ''}" data-view="grid">Month</button>
            <button class="cal-view-btn ${state.view === 'list' ? 'active' : ''}" data-view="list">List</button>
          </div>
        </div>
        <div class="cal-chip-row">
          ${chipGroup('country', 'Country', countries)}
        </div>
        <div class="cal-chip-row">
          ${chipGroup('status', 'Status', statuses)}
        </div>
        <div class="cal-chip-row">
          ${multiChipGroup('channels', 'Channel', channels.filter(c => c !== 'All'))}
        </div>
        <div class="cal-select-row">
          ${selectGroup('owner', 'Owner', owners)}
          <button class="cal-clear-btn" id="cal-clear">Clear filters</button>
        </div>
      </div>
    `;
  }

  function chipGroup(key, label, options) {
    const sel = state.filters[key];
    return `
      <div class="cal-chip-group" data-filter="${key}">
        <span class="cal-chip-label">${label}:</span>
        ${options.map(o => `<button class="cal-chip ${o === sel ? 'active' : ''}" data-value="${escapeAttr(o)}">${escapeHtml(o)}</button>`).join('')}
      </div>
    `;
  }

  function multiChipGroup(key, label, options) {
    const selected = state.filters[key] || [];
    const allActive = selected.length === 0;
    return `
      <div class="cal-chip-group cal-chip-group-multi" data-multi-filter="${key}">
        <span class="cal-chip-label">${label}:</span>
        <button class="cal-chip ${allActive ? 'active' : ''}" data-value="__all__">All</button>
        ${options.map(o => `<button class="cal-chip ${selected.includes(o) ? 'active' : ''}" data-value="${escapeAttr(o)}">${escapeHtml(o)}</button>`).join('')}
      </div>
    `;
  }

  function selectGroup(key, label, options) {
    const sel = state.filters[key];
    return `
      <label class="cal-select-wrap">
        <span class="cal-select-label">${label}</span>
        <select class="cal-select" data-filter="${key}">
          ${options.map(o => `<option value="${escapeAttr(o)}" ${o === sel ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}
        </select>
      </label>
    `;
  }

  // ── Render: grid view ───────────────────────────────────────────────
  function renderGrid(events) {
    const cursor = state.cursor;
    const monthStart = startOfMonth(cursor);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    // Find first Monday on or before monthStart
    const startWeekday = (monthStart.getDay() + 6) % 7; // Mon=0
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - startWeekday);

    // Build 6 weeks (42 days) for stable height
    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      days.push(d);
    }

    // Index events by yyyy-mm-dd
    const byDay = new Map();
    events.forEach(e => {
      const d = e._start;
      const key = d.toISOString().slice(0,10);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(e);
    });

    const today = new Date();

    return `
      <div class="cal-grid-wrap">
        <div class="cal-month-nav">
          <button class="cal-nav-btn" id="cal-prev">‹</button>
          <div class="cal-month-title">${MONTH_NAMES[monthStart.getMonth()]} ${monthStart.getFullYear()}</div>
          <button class="cal-nav-btn" id="cal-next">›</button>
          <button class="cal-today-btn" id="cal-today">Today</button>
          <span class="cal-count">${events.length} events</span>
        </div>
        <div class="cal-weekday-row">
          ${WEEKDAY_LABELS.map(w => `<div class="cal-weekday">${w}</div>`).join('')}
        </div>
        <div class="cal-grid">
          ${days.map(d => {
            const inMonth = d.getMonth() === monthStart.getMonth();
            const isToday = sameDay(d, today);
            const key = d.toISOString().slice(0,10);
            const dayEvents = byDay.get(key) || [];
            const visible = dayEvents.slice(0, 3);
            const overflow = dayEvents.length - visible.length;
            return `
              <div class="cal-day ${inMonth ? '' : 'cal-day-out'} ${isToday ? 'cal-day-today' : ''}">
                <div class="cal-day-num">${d.getDate()}</div>
                <div class="cal-day-events">
                  ${visible.map(e => eventPill(e)).join('')}
                  ${overflow > 0 ? `<button class="cal-day-more" data-day="${key}">+${overflow} more</button>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function eventPill(e) {
    const c = STATUS_COLORS[e.status] || DEFAULT_COLOR;
    const flag = (e.country || '').slice(0, 4);
    return `
      <button class="cal-pill" style="background:${c.bg};color:${c.fg};" data-event="${e.id}" title="${escapeAttr(e.name)}">
        <span class="cal-pill-dot" style="background:${c.dot};"></span>
        <span class="cal-pill-flag">${escapeHtml(flag)}</span>
        <span class="cal-pill-name">${escapeHtml(e.name)}</span>
      </button>
    `;
  }

  // ── Render: list view ───────────────────────────────────────────────
  function renderList(events) {
    if (!events.length) {
      return `<div class="cal-empty">No events match your filters.</div>`;
    }
    const sorted = [...events].sort((a,b) => a._start - b._start);
    // Group by month
    const groups = new Map();
    sorted.forEach(e => {
      const k = e._start.getFullYear() + '-' + e._start.getMonth();
      if (!groups.has(k)) groups.set(k, { date: e._start, items: [] });
      groups.get(k).items.push(e);
    });
    return `
      <div class="cal-list-wrap">
        <div class="cal-list-meta"><span class="cal-count">${events.length} events</span></div>
        ${[...groups.values()].map(g => `
          <div class="cal-list-month">
            <h3 class="cal-list-month-title">${MONTH_NAMES[g.date.getMonth()]} ${g.date.getFullYear()}</h3>
            <div class="cal-list-items">
              ${g.items.map(e => listRow(e)).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function listRow(e) {
    const c = STATUS_COLORS[e.status] || DEFAULT_COLOR;
    const dateRange = e._end && !sameDay(e._start, e._end)
      ? `${fmtDateShort(e._start)} → ${fmtDateShort(e._end)}`
      : fmtDateShort(e._start);
    return `
      <button class="cal-list-row" data-event="${e.id}">
        <div class="cal-list-date ${e._approx ? 'cal-list-date-approx' : ''}">
          <div class="cal-list-day">${e._approx ? 'TBD' : e._start.getDate()}</div>
          <div class="cal-list-mon">${MONTH_NAMES[e._start.getMonth()].slice(0,3)}</div>
        </div>
        <div class="cal-list-body">
          <div class="cal-list-name">${escapeHtml(e.name)}</div>
          <div class="cal-list-meta-row">
            <span class="cal-status-tag" style="background:${c.bg};color:${c.fg};">${escapeHtml(e.status || '')}</span>
            ${e.country ? `<span class="cal-meta-chip">${escapeHtml(e.country)}</span>` : ''}
            ${e.channel ? `<span class="cal-meta-chip">${escapeHtml(e.channel)}</span>` : ''}
            ${e.owner ? `<span class="cal-meta-chip cal-meta-owner">${escapeHtml(e.owner)}</span>` : ''}
            ${e.partner ? `<span class="cal-meta-chip">🤝 ${escapeHtml(e.partner)}</span>` : ''}
            ${e._end && !sameDay(e._start, e._end) ? `<span class="cal-meta-chip">${dateRange}</span>` : ''}
          </div>
        </div>
        <div class="cal-list-arrow">→</div>
      </button>
    `;
  }

  // ── Render: detail panel ────────────────────────────────────────────
  function renderDetail(e) {
    if (!e) return '';
    const c = STATUS_COLORS[e.status] || DEFAULT_COLOR;
    let dateRange = e._end && !sameDay(e._start, e._end)
      ? `${fmtDateLong(e._start)} → ${fmtDateLong(e._end)}`
      : fmtDateLong(e._start);
    if (e._approx) dateRange = `${MONTH_NAMES[e._start.getMonth()]} ${e._start.getFullYear()} (day TBD)`;
    return `
      <div class="cal-detail-overlay" id="cal-detail-overlay"></div>
      <aside class="cal-detail-panel" role="dialog" aria-label="Event details">
        <div class="cal-detail-head">
          <button class="cal-detail-close" id="cal-detail-close" aria-label="Close">×</button>
          <span class="cal-status-tag" style="background:${c.bg};color:${c.fg};">${escapeHtml(e.status || '')}</span>
          <h2 class="cal-detail-title">${escapeHtml(e.name)}</h2>
          <div class="cal-detail-date">${dateRange}${e.time ? ' · ' + escapeHtml(e.time) : ''}</div>
        </div>
        <div class="cal-detail-body">
          ${detailRow('Country', e.country)}
          ${detailRow('Owner', e.owner)}
          ${detailRow('Source', e.source)}
          ${detailRow('Channel', e.channel)}
          ${detailRow('Location', e.location)}
          ${detailRow('Segment', e.segment)}
          ${detailRow('Partner', e.partner)}
          ${detailRow('Publication', e.publication)}
          ${detailRow('Objective', e.objective)}
          ${detailRow('Hero message', e.hero)}
          ${detailRow('Notes', e.notes)}
          ${linksBlock(e)}
        </div>
      </aside>
    `;
  }

  function detailRow(label, value) {
    if (!value) return '';
    return `
      <div class="cal-detail-row">
        <div class="cal-detail-label">${label}</div>
        <div class="cal-detail-value">${escapeHtml(value)}</div>
      </div>
    `;
  }

  function linksBlock(e) {
    const links = [];
    if (e.vault) links.push({ label: 'Vault project', url: e.vault });
    if (e.sf_link) links.push({ label: 'Salesforce', url: e.sf_link });
    if (e.resource) links.push({ label: 'Resource', url: e.resource });
    if (!links.length) return '';
    return `
      <div class="cal-detail-row">
        <div class="cal-detail-label">Links</div>
        <div class="cal-detail-links">
          ${links.map(l => `<a href="${escapeAttr(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)} →</a>`).join('')}
        </div>
      </div>
    `;
  }

  // ── Day expansion popover (when "+N more" clicked) ──────────────────
  function renderDayList(dayKey, events) {
    const dayEvents = events.filter(e => e._start.toISOString().slice(0,10) === dayKey);
    if (!dayEvents.length) return '';
    const d = new Date(dayKey + 'T00:00:00');
    return `
      <div class="cal-detail-overlay" id="cal-detail-overlay"></div>
      <aside class="cal-detail-panel" role="dialog" aria-label="Day events">
        <div class="cal-detail-head">
          <button class="cal-detail-close" id="cal-detail-close" aria-label="Close">×</button>
          <h2 class="cal-detail-title">${fmtDateLong(d)}</h2>
          <div class="cal-detail-date">${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}</div>
        </div>
        <div class="cal-detail-body">
          <div class="cal-list-items">
            ${dayEvents.map(e => listRow(e)).join('')}
          </div>
        </div>
      </aside>
    `;
  }

  // ── Helpers ─────────────────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ── Main render ─────────────────────────────────────────────────────
  function render() {
    const root = document.getElementById('calendar-root');
    if (!root) return;
    const filtered = applyFilters(allEvents);
    const main = state.view === 'grid' ? renderGrid(filtered) : renderList(filtered);

    let detailHtml = '';
    if (state.selected) {
      if (typeof state.selected === 'string' && state.selected.startsWith('day:')) {
        detailHtml = renderDayList(state.selected.slice(4), filtered);
      } else {
        const ev = allEvents.find(e => e.id === state.selected);
        if (ev) detailHtml = renderDetail(ev);
      }
    }

    root.innerHTML = `
      ${renderFilterBar(allEvents)}
      <div class="cal-main">${main}</div>
      ${detailHtml}
    `;
    bindEvents();
  }

  function bindEvents() {
    const root = document.getElementById('calendar-root');
    if (!root) return;

    // Search
    const search = root.querySelector('#cal-search');
    if (search) {
      search.addEventListener('input', () => {
        state.filters.q = search.value;
        const main = root.querySelector('.cal-main');
        const filtered = applyFilters(allEvents);
        if (main) main.innerHTML = state.view === 'grid' ? renderGrid(filtered) : renderList(filtered);
        bindMainOnly();
      });
    }

    // View toggle
    root.querySelectorAll('.cal-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.view = btn.dataset.view;
        render();
      });
    });

    // Single-select chips
    root.querySelectorAll('.cal-chip-group:not(.cal-chip-group-multi)').forEach(group => {
      const key = group.dataset.filter;
      group.querySelectorAll('.cal-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          state.filters[key] = chip.dataset.value;
          render();
        });
      });
    });

    // Multi-select chips
    root.querySelectorAll('.cal-chip-group-multi').forEach(group => {
      const key = group.dataset.multiFilter;
      group.querySelectorAll('.cal-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const v = chip.dataset.value;
          if (v === '__all__') {
            state.filters[key] = [];
          } else {
            const set = new Set(state.filters[key] || []);
            if (set.has(v)) set.delete(v); else set.add(v);
            state.filters[key] = [...set];
          }
          render();
        });
      });
    });

    // Selects
    root.querySelectorAll('.cal-select').forEach(sel => {
      const key = sel.dataset.filter;
      sel.addEventListener('change', () => {
        state.filters[key] = sel.value;
        render();
      });
    });

    // Clear
    const clear = root.querySelector('#cal-clear');
    if (clear) {
      clear.addEventListener('click', () => {
        state.filters = { country: 'All', status: 'All', channels: [], owner: 'All', q: '' };
        render();
      });
    }

    bindMainOnly();
    bindDetail();
  }

  function bindMainOnly() {
    const root = document.getElementById('calendar-root');
    if (!root) return;
    // Nav
    root.querySelector('#cal-prev')?.addEventListener('click', () => { state.cursor = addMonths(state.cursor, -1); render(); });
    root.querySelector('#cal-next')?.addEventListener('click', () => { state.cursor = addMonths(state.cursor, 1); render(); });
    root.querySelector('#cal-today')?.addEventListener('click', () => { state.cursor = startOfMonth(new Date()); render(); });
    // Pills
    root.querySelectorAll('.cal-pill, .cal-list-row').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selected = parseInt(btn.dataset.event);
        render();
      });
    });
    // Day overflow
    root.querySelectorAll('.cal-day-more').forEach(btn => {
      btn.addEventListener('click', () => {
        state.selected = 'day:' + btn.dataset.day;
        render();
      });
    });
  }

  function bindDetail() {
    const root = document.getElementById('calendar-root');
    if (!root) return;
    const close = () => { state.selected = null; render(); };
    root.querySelector('#cal-detail-close')?.addEventListener('click', close);
    root.querySelector('#cal-detail-overlay')?.addEventListener('click', close);
  }

  // ── Public init ─────────────────────────────────────────────────────
  function initCalendar() {
    if (!window.CALENDAR_EVENTS) {
      console.warn('[calendar] CALENDAR_EVENTS not loaded');
      return;
    }
    allEvents = normalize(window.CALENDAR_EVENTS);

    // Default cursor: month with most events near today
    const today = new Date();
    if (!state.cursor) {
      // Pick the closest event-bearing month to today
      const months = new Set(allEvents.map(e => e._start.getFullYear() + '-' + e._start.getMonth()));
      const todayKey = today.getFullYear() + '-' + today.getMonth();
      if (months.has(todayKey)) {
        state.cursor = startOfMonth(today);
      } else {
        // Fall back to the latest month with data ≤ today, else earliest in future
        const sorted = [...allEvents].map(e => e._start).sort((a,b) => a-b);
        const before = sorted.filter(d => d <= today).pop();
        state.cursor = startOfMonth(before || sorted[0] || today);
      }
    }
    render();
  }

  window.initMarketingCalendar = initCalendar;
})();
