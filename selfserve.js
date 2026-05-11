/* ANZ Marketing Menu Card — render + filter */
(function () {
  let allSections = [];
  let pageTitle = '';
  let intro = '';
  let footer = null;
  let state = {
    q: '',
    section: 'All',
  };

  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // Smart label based on the destination
  function smartLabel(url) {
    try {
      const u = new URL(url);
      const h = u.hostname;
      if (h.includes('docs.google.com')) {
        if (u.pathname.includes('/presentation/')) return 'Open Slides';
        if (u.pathname.includes('/document/')) return 'Open Doc';
        if (u.pathname.includes('/spreadsheets/')) return 'Open Sheet';
        return 'Open in Drive';
      }
      if (h.includes('slack.com')) return 'Open in Slack';
      if (h.includes('quick.shopify.io')) return 'Open Quick site';
      if (h.includes('notebooklm.google.com')) return 'Open in NotebookLM';
      if (h.includes('vault.shopify.io')) return 'Open in Vault';
      return 'Open link';
    } catch (_) {
      return 'Open link';
    }
  }

  // Phrases that aren't links — render as status tags instead
  const STATUS_TAGS = [
    'brief required', 'on request', 'ask first', 'tbd', 'standing deliverable',
    'see events tab', 'see partner mktg tab', 'see partner marketing tab',
  ];
  function isStatusPhrase(s) {
    return STATUS_TAGS.includes(s.toLowerCase().trim());
  }

  // Parse multiple links in a single cell (e.g. "Foo: https://x  |  Bar: https://y")
  function parseLinks(linkCell) {
    if (!linkCell) return [];
    const urlRegex = /https?:\/\/[^\s|]+/g;
    const urls = linkCell.match(urlRegex) || [];
    if (urls.length === 0) {
      return [{ label: linkCell, url: null, status: isStatusPhrase(linkCell) }];
    }
    if (urls.length === 1) {
      const before = linkCell.split(urls[0])[0].replace(/[:|]\s*$/, '').trim();
      return [{ label: before || smartLabel(urls[0]), url: urls[0] }];
    }
    // Multiple URLs separated by |
    const parts = linkCell.split('|').map(p => p.trim());
    return parts.map(part => {
      const m = part.match(/https?:\/\/\S+/);
      const url = m ? m[0] : null;
      const label = part.replace(url || '', '').replace(/[:]\s*$/, '').trim();
      return { label: label || (url ? smartLabel(url) : 'Open'), url };
    });
  }

  function applyFilter(sections) {
    const q = state.q.toLowerCase().trim();
    return sections
      .filter(s => state.section === 'All' || s.short === state.section)
      .map(s => ({
        ...s,
        items: !q ? s.items : s.items.filter(it => {
          return (it.name + ' ' + (it.when || '') + ' ' + (it.contact || '')).toLowerCase().includes(q);
        }),
      }))
      .filter(s => s.items.length > 0);
  }

  function render() {
    const root = document.getElementById('selfserve-root');
    if (!root) return;
    const filtered = applyFilter(allSections);

    root.innerHTML = `
      <div class="ss-intro">
        <p>${escapeHtml(intro)}</p>
      </div>

      <div class="ss-filters">
        <div class="ss-search">
          <input type="text" id="ss-search" placeholder="Search assets, use cases, contacts…" value="${escapeAttr(state.q)}" />
        </div>
        <div class="ss-chip-row">
          <span class="ss-chip-label">Section:</span>
          ${['All', ...allSections.map(s => s.short)].map(name => `
            <button class="ss-chip ${state.section === name ? 'active' : ''}" data-section="${escapeAttr(name)}">${escapeHtml(name)}</button>
          `).join('')}
        </div>
      </div>

      ${filtered.length === 0 ? `<div class="ss-empty">Nothing matches "<strong>${escapeHtml(state.q)}</strong>". Try a different search.</div>` : ''}

      ${filtered.map(section => renderSection(section)).join('')}

      ${footer ? renderFooter(footer) : ''}
    `;

    bind();
  }

  function renderSection(section) {
    return `
      <div class="ss-section">
        <h2 class="ss-section-title">
          <span class="ss-section-icon">${section.icon}</span>
          ${escapeHtml(section.title)}
          <span class="ss-section-count">${section.items.length}</span>
        </h2>
        <div class="ss-cards">
          ${section.items.map(item => renderCard(item)).join('')}
        </div>
      </div>
    `;
  }

  function renderCard(item) {
    if (item.note) {
      return `<div class="ss-card ss-card-note">${escapeHtml(item.name)}</div>`;
    }
    const links = parseLinks(item.link);
    return `
      <div class="ss-card">
        <div class="ss-card-name">${escapeHtml(item.name)}</div>
        ${item.when ? `<div class="ss-card-when"><span class="ss-card-meta-label">When to use</span>${escapeHtml(item.when)}</div>` : ''}
        ${links.length > 0 ? `
          <div class="ss-card-links">
            ${links.map(l => l.url
              ? `<a class="ss-card-link" href="${escapeAttr(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label || 'Open')} <span class="ss-arrow">→</span></a>`
              : (l.status
                  ? `<span class="ss-card-status">${escapeHtml(l.label)}</span>`
                  : `<span class="ss-card-link-text">${escapeHtml(l.label)}</span>`)
            ).join('')}
          </div>
        ` : ''}
        ${item.contact ? `<div class="ss-card-contact"><span class="ss-card-meta-label">Who</span>${escapeHtml(item.contact)}</div>` : ''}
      </div>
    `;
  }

  function renderFooter(f) {
    return `
      <div class="ss-footer">
        <div class="ss-footer-icon">💬</div>
        <div class="ss-footer-body">
          <div class="ss-footer-title">${escapeHtml(f.name)}</div>
          ${f.when ? `<div class="ss-footer-when">${escapeHtml(f.when)}</div>` : ''}
          ${f.link ? `<a class="ss-footer-link" href="${escapeAttr(f.link)}" target="_blank" rel="noopener">Open Slack channel →</a>` : ''}
        </div>
      </div>
    `;
  }

  function bind() {
    const root = document.getElementById('selfserve-root');
    if (!root) return;

    const search = root.querySelector('#ss-search');
    if (search) {
      search.addEventListener('input', () => {
        state.q = search.value;
        render();
        // Re-focus the input
        const newSearch = document.getElementById('ss-search');
        if (newSearch) {
          newSearch.focus();
          newSearch.setSelectionRange(state.q.length, state.q.length);
        }
      });
    }

    root.querySelectorAll('.ss-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        state.section = chip.dataset.section;
        render();
      });
    });
  }

  // Display order — promoted sections first, then everything else in sheet order
  const SECTION_ORDER = ['General', 'Content', 'ABM', 'Events', 'Retention'];

  function reorderSections(sections) {
    const byShort = new Map(sections.map(s => [s.short, s]));
    const seen = new Set();
    const ordered = [];
    SECTION_ORDER.forEach(name => {
      if (byShort.has(name)) { ordered.push(byShort.get(name)); seen.add(name); }
    });
    sections.forEach(s => { if (!seen.has(s.short)) ordered.push(s); });
    return ordered;
  }

  function initSelfServe() {
    const data = window.SELFSERVE_DATA;
    if (!data) {
      console.warn('[selfserve] SELFSERVE_DATA not loaded');
      return;
    }
    pageTitle = data.pageTitle;
    intro = data.intro;
    allSections = reorderSections(data.sections);
    footer = data.footer;

    // Update page header title if present
    const hdr = document.querySelector('#self-serve .page-header h1');
    if (hdr && pageTitle) hdr.textContent = pageTitle;

    render();
  }

  window.initSelfServe = initSelfServe;
})();
