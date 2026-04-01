/**
 * APAC Marketing Hub — Master Sheet Generator
 *
 * Run this ONCE to create the full master Google Sheet with all 14 tabs.
 *
 * How to run:
 *   1. Go to https://script.google.com → New project
 *   2. Paste this entire file into the editor
 *   3. Click Run → createMasterSheet
 *   4. Grant permissions when prompted
 *   5. The script will open the new sheet and show you its ID
 *   6. Copy the Sheet ID into config.js → MASTER_SHEET_ID
 *
 * The sheet will be created in your Google Drive root.
 * You can move it to a shared drive afterwards.
 */

function createMasterSheet() {
  const ss = SpreadsheetApp.create('APAC Marketing Hub — Master Sheet');
  const url = ss.getUrl();
  const id  = ss.getId();

  // ── Delete the default blank sheet last (can't delete if it's the only one)
  const defaultSheet = ss.getSheets()[0];

  // ── Create all tabs ───────────────────────────────────────────────────────
  buildInstructions(ss);
  buildOrgChart(ss);
  buildTactics(ss);
  buildAnnouncements(ss);
  buildTeam(ss);
  buildKeyStats(ss);
  buildCampaigns(ss);
  buildCompetitive(ss);
  buildResources(ss);
  buildOKRs(ss);
  buildAssets(ss);
  buildOnboarding(ss);
  buildComms(ss);
  buildInsights(ss);
  buildAiTools(ss);
  buildBrand(ss);

  // Remove the default "Sheet1"
  ss.deleteSheet(defaultSheet);

  // Open the sheet in the browser
  SpreadsheetApp.flush();

  const msg = `✅ Master sheet created!\n\nURL: ${url}\n\nSheet ID (copy this into config.js → MASTER_SHEET_ID):\n${id}`;
  Logger.log(msg);
  SpreadsheetApp.getUi().alert('APAC Marketing Hub — Master Sheet Created', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const GREEN      = '#008060';
const GREEN_LIGHT = '#E6F4F0';
const WHITE      = '#FFFFFF';
const GRAY_TEXT  = '#6B7280';

function createTab(ss, name) {
  return ss.insertSheet(name);
}

function formatHeader(sheet, headers) {
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  sheet.appendRow(headers);
  headerRange.setValues([headers]);
  headerRange.setBackground(GREEN);
  headerRange.setFontColor(WHITE);
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, headers.length, 180);
}

function addNote(sheet, col, note) {
  sheet.getRange(1, col).setNote(note);
}

function addRows(sheet, rows) {
  if (!rows.length) return;
  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
  // Zebra stripe sample rows
  rows.forEach((_, i) => {
    if (i % 2 === 0) {
      sheet.getRange(startRow + i, 1, 1, rows[0].length).setBackground(GREEN_LIGHT);
    }
  });
}

// ── Tab builders ──────────────────────────────────────────────────────────────

function buildInstructions(ss) {
  const sheet = createTab(ss, '📋 Instructions');
  sheet.setTabColor('#008060');

  const rows = [
    ['APAC Marketing Hub — Master Sheet', '', '', ''],
    ['', '', '', ''],
    ['This sheet powers the APAC Marketing Hub at apacmarketinghub.quick.shopify.io', '', '', ''],
    ['Edit any tab below to update content on the hub. Changes appear on the next page refresh — no deployment needed.', '', '', ''],
    ['', '', '', ''],

    ['─── HOW TO UPDATE CONTENT ───────────────────────────────────────────────────────────────────────────────────────────────────────────────', '', '', ''],
    ['Tab', 'Updates this section on the hub', 'Key columns', 'Notes'],
    ['org_chart', 'Org Chart — team cards on the Org Chart tab', 'Name, Title, Photo URL, Slack Handle, Description, Vault URL', 'Row order = card order. Delete whole row to remove someone. Do NOT leave blank rows.'],
    ['tactics', 'Calendar — live marketing activities', 'Tactic Name, Type, Market, Owner, Start Date, End Date, Status, Brief Link', 'Dates must be YYYY-MM-DD. Status: Planned / In Progress / Live / Complete'],
    ['announcements', 'Home page feed', 'timestamp, author, message, slack_link', 'Can be auto-filled by Zapier (Slack → Sheet)'],
    ['key_stats', 'Key Stats — metric numbers', 'label, value, delta, direction', 'direction: up / down / neutral'],
    ['campaigns', 'Campaign Deep Dive', 'name, owner, start_date, end_date, status, brief_link', ''],
    ['competitive', 'Market Insights + Competitor', 'title, url, description, icon', 'icon = optional emoji'],
    ['resources', 'Account Insights', 'title, url, description, icon, category', 'category = "account" to surface in Account Insights'],
    ['okrs', 'Mktg Strategy + OKRs', 'title, url, description', ''],
    ['assets', 'Content Repository', 'title, url, description, icon, type', 'type = Deck / Template / Image / Video / Guide'],
    ['onboarding', 'Self-Serve Guides', 'title, url, description, icon', ''],
    ['comms', 'Comms + PR', 'title, url, description, icon', ''],
    ['ai_tools', 'Useful Agents + Tools', 'title, url, description, icon', ''],
    ['brand', 'Be a Brand Champion', 'title, url, description, icon', ''],
    ['', '', '', ''],

    ['─── ORG CHART ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────', '', '', ''],
    ['The Org Chart is managed in the "org_chart" tab of THIS sheet (see tab below).', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['Org Chart column requirements:', '', '', ''],
    ['Column', 'Required?', 'Format / tips', 'Example'],
    ['Name', '✅ Yes', 'Full name', 'Shalini Keyan'],
    ['Title', '✅ Yes', 'Job title / role', 'Head of APAC Marketing'],
    ['Photo URL', 'Recommended', 'Direct image URL. For Google Drive: share → "Anyone with link" → convert to: https://drive.google.com/uc?export=view&id=FILE_ID', 'https://drive.google.com/uc?export=view&id=abc123'],
    ['Slack Handle', 'Recommended', 'Username WITHOUT the @ sign', 'shalini.keyan'],
    ['Description', 'Recommended', '1–2 sentences: focus area or what they do', 'Leads APAC enterprise campaigns and partner events'],
    ['Vault URL', 'Recommended', 'Their Vault profile URL', 'https://vault.shopify.io/people/shalini-keyan'],
    ['', '', '', ''],
    ['WHEN SOMEONE JOINS: Add a new row with all 6 columns. Hub updates automatically.', '', '', ''],
    ['WHEN SOMEONE LEAVES: Delete their row entirely. Do not leave blank rows.', '', '', ''],
    ['WHEN SOMEONE CHANGES ROLE: Edit their Title and Description cells directly.', '', '', ''],
    ['Row ORDER = card order on the hub. Put senior roles first, or sort alphabetically.', '', '', ''],
    ['', '', '', ''],

    ['─── HOT THIS WEEK ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────', '', '', ''],
    ['The "🔥 Hot This Week" banner is NOT managed here — it lives in config.js in the code repo.', '', '', ''],
    ['Ask Shalini or Carlotta to update it. Each item: emoji, title, desc, link (optional).', '', '', ''],
    ['', '', '', ''],

    ['─── MAINTAINER CONTACTS ────────────────────────────────────────────────────────────────────────────────────────────────────────────────', '', '', ''],
    ['Hub owner', 'Shalini Keyan — shalini.keyan@shopify.com / @shalini.keyan on Slack', '', ''],
    ['Sheet co-owner', 'Carlotta Criel — carlotta.criel@shopify.com / @carlotta.criel on Slack', '', ''],
    ['Code repo', 'https://github.com/carlottacriel/apacmarketinghub', '', ''],
    ['Live site', 'https://apacmarketinghub.quick.shopify.io/', '', ''],
  ];

  // Write all rows
  sheet.getRange(1, 1, rows.length, 4).setValues(rows);

  // Style the title row
  const titleRange = sheet.getRange(1, 1);
  titleRange.setFontSize(16).setFontWeight('bold').setFontColor(GREEN);

  // Style section divider rows
  [6, 20, 33, 42, 47].forEach(r => {
    sheet.getRange(r, 1).setFontWeight('bold').setFontColor(GREEN).setFontSize(10);
  });

  // Style the three header rows (Tab / Column columns)
  [7, 25].forEach(r => {
    sheet.getRange(r, 1, 1, 4).setBackground(GREEN).setFontColor(WHITE).setFontWeight('bold');
  });

  // Style warning/action rows
  [36, 37, 38, 39].forEach(r => {
    sheet.getRange(r, 1).setFontWeight('bold');
  });

  // Column widths
  sheet.setColumnWidth(1, 240);
  sheet.setColumnWidth(2, 360);
  sheet.setColumnWidth(3, 480);
  sheet.setColumnWidth(4, 340);

  sheet.setFrozenRows(1);
}

function buildOrgChart(ss) {
  const sheet = createTab(ss, 'org_chart');
  sheet.setTabColor('#008060');
  const headers = ['Name', 'Title', 'Photo URL', 'Slack Handle', 'Description', 'Vault URL'];
  formatHeader(sheet, headers);

  addNote(sheet, 1, 'Full name — shown on the card and used for the avatar initial if no photo');
  addNote(sheet, 2, 'Job title / role (e.g. "Senior Marketing Manager, ANZ")');
  addNote(sheet, 3, 'Direct image URL. For Google Drive: share file → "Anyone with link" → copy link ID → use https://drive.google.com/uc?export=view&id=FILE_ID');
  addNote(sheet, 4, 'Slack username WITHOUT the @ sign (e.g. shalini.keyan). Links to their Slack profile.');
  addNote(sheet, 5, '1-2 sentences: what they focus on or own');
  addNote(sheet, 6, 'Their Vault profile URL — clicking their name opens this. Format: https://vault.shopify.io/people/firstname-lastname');

  addRows(sheet, [
    ['Shalini Keyan',   'Head of APAC Marketing',              '', 'shalini.keyan',   'Leads APAC enterprise marketing strategy, field programs and team operations.', 'https://vault.shopify.io/people/shalini-keyan'],
    ['Carlotta Criel',  'ANZ Marketing Manager',               '', 'carlotta.criel',  'Owns ANZ go-to-market campaigns, partner marketing and merchant events.',        'https://vault.shopify.io/people/carlotta-criel'],
    ['Gabby Song',      'APAC Campaign Manager',               '', 'gabbysong18',     'Manages paid and organic campaigns across SEA and ANZ markets.',                 'https://vault.shopify.io/people/gabby-song'],
  ]);

  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(3, 320);
  sheet.setColumnWidth(4, 180);
  sheet.setColumnWidth(5, 380);
  sheet.setColumnWidth(6, 300);
}

function buildTactics(ss) {
  const sheet = createTab(ss, 'tactics');
  const headers = ['Tactic Name', 'Type', 'Market', 'Owner', 'Start Date', 'End Date', 'Status', 'Brief Link', 'Description'];
  formatHeader(sheet, headers);

  addNote(sheet, 2, 'Values: Event, Paid, Email, Content, PR, Webinar, Field, Social');
  addNote(sheet, 3, 'Values: ANZ, SEA, JP, IN, APAC');
  addNote(sheet, 7, 'Values: Planned, In Progress, Live, Complete');
  addNote(sheet, 5, 'Format: YYYY-MM-DD');
  addNote(sheet, 6, 'Format: YYYY-MM-DD');

  addRows(sheet, [
    ['Shopify Unite ANZ', 'Event', 'ANZ', 'shalini.keyan', '2026-04-15', '2026-04-16', 'Planned', 'https://vault.shopify.io/', 'Annual merchant summit'],
    ['Q2 Paid Social ANZ', 'Paid', 'ANZ', 'carlotta.criel', '2026-04-01', '2026-06-30', 'In Progress', 'https://vault.shopify.io/', 'Meta + LinkedIn campaign'],
    ['APAC Merchant Newsletter', 'Email', 'APAC', 'shalini.keyan', '2026-04-10', '2026-04-10', 'Planned', '', 'Monthly newsletter'],
    ['SEA Partner Webinar', 'Webinar', 'SEA', 'carlotta.criel', '2026-05-08', '2026-05-08', 'Planned', 'https://vault.shopify.io/', 'Partner enablement session'],
  ]);

  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(8, 260);
  sheet.setColumnWidth(9, 300);
}

function buildAnnouncements(ss) {
  const sheet = createTab(ss, 'announcements');
  const headers = ['timestamp', 'author', 'message', 'slack_link'];
  formatHeader(sheet, headers);

  addNote(sheet, 1, 'Auto-populated by Zapier (Slack → Sheet). Format: YYYY-MM-DD HH:MM');
  addNote(sheet, 4, 'Deep link to the Slack message');

  addRows(sheet, [
    ['2026-03-25 09:00', 'Shalini Keyan', 'Welcome to the APAC Marketing Hub! 🎉 Your single source of truth for campaigns, insights and resources.', 'https://shopify.slack.com/channels/apac-marketing'],
    ['2026-03-24 14:30', 'Carlotta Criel', 'Q2 campaign briefs are now live — check the Tactic Tracker tab for all upcoming activities.', 'https://shopify.slack.com/channels/apac-marketing'],
  ]);

  sheet.setColumnWidth(3, 400);
  sheet.setColumnWidth(4, 300);
}

function buildTeam(ss) {
  const sheet = createTab(ss, 'team');
  const headers = ['name', 'role', 'photo_url', 'slack_handle'];
  formatHeader(sheet, headers);

  addNote(sheet, 3, 'Direct URL to a headshot image (Google Drive "Anyone with link" share, converted to direct URL)');
  addNote(sheet, 4, 'Slack handle without the @ (e.g. shalini.keyan)');

  addRows(sheet, [
    ['Shalini Keyan', 'Head of APAC Marketing', '', 'shalini.keyan'],
    ['Carlotta Criel', 'ANZ Marketing Manager', '', 'carlotta.criel'],
    ['Gabby Song', 'APAC Campaign Manager', '', 'gabbysong18'],
  ]);

  sheet.setColumnWidth(2, 240);
  sheet.setColumnWidth(3, 300);
}

function buildKeyStats(ss) {
  const sheet = createTab(ss, 'key_stats');
  const headers = ['label', 'value', 'delta', 'direction'];
  formatHeader(sheet, headers);

  addNote(sheet, 4, 'Values: up, down, neutral');

  addRows(sheet, [
    ['GMV', '$12.4M', '+18% QoQ', 'up'],
    ['Pipeline', '$4.2M', '+9% QoQ', 'up'],
    ['SALs', '142', '-3% QoQ', 'down'],
    ['Events Run', '8', '+2 vs last Q', 'up'],
    ['Email Open Rate', '28.4%', '+1.2pp', 'up'],
    ['Paid ROAS', '3.2x', 'Flat', 'neutral'],
  ]);
}

function buildCampaigns(ss) {
  const sheet = createTab(ss, 'campaigns');
  const headers = ['name', 'owner', 'start_date', 'end_date', 'status', 'brief_link'];
  formatHeader(sheet, headers);

  addNote(sheet, 5, 'Values: Planned, In Progress, Live, Complete, Paused');
  addNote(sheet, 3, 'Format: YYYY-MM-DD');
  addNote(sheet, 4, 'Format: YYYY-MM-DD');
  addNote(sheet, 6, 'Link to Vault or Google Drive campaign brief');

  addRows(sheet, [
    ['Q2 ANZ Paid Social', 'Carlotta Criel', '2026-04-01', '2026-06-30', 'In Progress', 'https://vault.shopify.io/'],
    ['Shopify Unite ANZ', 'Shalini Keyan', '2026-04-15', '2026-04-16', 'Planned', 'https://vault.shopify.io/'],
    ['APAC Spring Newsletter', 'Shalini Keyan', '2026-04-10', '2026-04-10', 'Planned', ''],
    ['SEA LinkedIn Campaign', 'Gabby Song', '2026-05-01', '2026-05-31', 'Planned', 'https://vault.shopify.io/'],
  ]);

  sheet.setColumnWidth(1, 240);
  sheet.setColumnWidth(6, 280);
}

function buildCompetitive(ss) {
  const sheet = createTab(ss, 'competitive');
  const headers = ['title', 'url', 'description', 'icon'];
  formatHeader(sheet, headers);

  addNote(sheet, 2, 'Link to Vault page, Google Doc, or external report');
  addNote(sheet, 4, 'Optional emoji (e.g. ⚔️ 🔍 📊). Leave blank for default.');

  addRows(sheet, [
    ['Competitive Intelligence Overview', 'https://vault.shopify.io/', 'Master battle cards and positioning vs key competitors', '⚔️'],
    ['BigCommerce Battle Card', 'https://vault.shopify.io/', 'APAC-specific positioning and objection handling', '🛡️'],
    ['WooCommerce Positioning', 'https://vault.shopify.io/', 'Why Shopify vs WooCommerce for APAC merchants', '📋'],
    ['APAC E-Commerce Market Report 2026', 'https://drive.google.com/', 'Statista annual market sizing report', '📊'],
    ['G2 Crowd Reviews Summary', 'https://www.g2.com/', 'Review trends vs competitors', '⭐'],
  ]);

  sheet.setColumnWidth(1, 280);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 360);
}

function buildResources(ss) {
  const sheet = createTab(ss, 'resources');
  const headers = ['title', 'url', 'description', 'icon', 'category'];
  formatHeader(sheet, headers);

  addNote(sheet, 5, 'Use "account" to surface in Account Insights. Other values: territory, enablement, general');
  addNote(sheet, 4, 'Optional emoji. Leave blank for default.');

  addRows(sheet, [
    ['ANZ Account List 2026', 'https://docs.google.com/', 'Full ANZ enterprise account list with tier and owner', '🏢', 'account'],
    ['APAC Territory Plan 2026', 'https://vault.shopify.io/', 'AE territory breakdown and priority accounts', '🗺️', 'territory'],
    ['Account Research Template', 'https://docs.google.com/', 'Pre-meeting research template for AEs', '📋', 'account'],
    ['Marketing Planning Guide', 'https://vault.shopify.io/', 'How to run a campaign from brief to launch', '📘', 'enablement'],
    ['APAC Merchant Persona Decks', 'https://drive.google.com/', 'Buyer personas for ANZ, SEA, JP, IN markets', '👤', 'general'],
  ]);

  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 360);
}

function buildOKRs(ss) {
  const sheet = createTab(ss, 'okrs');
  const headers = ['title', 'url', 'description'];
  formatHeader(sheet, headers);

  addNote(sheet, 2, 'Link to Vault OKR page, Google Sheet, or tracking doc');

  addRows(sheet, [
    ['APAC Marketing OKRs H1 2026', 'https://vault.shopify.io/', 'Team OKRs and key results for H1 — updated weekly'],
    ['ANZ GTM Scorecard', 'https://docs.google.com/', 'Weekly GTM metrics scorecard'],
    ['APAC Marketing Roadmap', 'https://vault.shopify.io/', 'Full-year planning roadmap and initiative tracking'],
    ['Budget Tracker 2026', 'https://docs.google.com/', 'APAC marketing budget vs actuals'],
  ]);

  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 360);
}

function buildAssets(ss) {
  const sheet = createTab(ss, 'assets');
  const headers = ['title', 'url', 'description', 'icon', 'type'];
  formatHeader(sheet, headers);

  addNote(sheet, 5, 'Used for filtering in the Content Repository. E.g. Deck, Template, Image, Video, Guide');
  addNote(sheet, 4, 'Optional emoji. Leave blank for default.');

  addRows(sheet, [
    ['APAC Brand Kit', 'https://drive.google.com/', 'Logos, fonts, colour palettes for all APAC markets', '🎨', 'Brand'],
    ['Q2 Campaign Deck Template', 'https://docs.google.com/', 'Master slide deck for campaign presentations', '📊', 'Deck'],
    ['Event Run Sheet Template', 'https://docs.google.com/', 'Standard event logistics run sheet', '📋', 'Template'],
    ['Shopify APAC Product One-Pager', 'https://drive.google.com/', 'Merchant-facing product overview for APAC', '📄', 'Collateral'],
    ['Social Media Asset Pack — Q2', 'https://drive.google.com/', 'Sized graphics for LinkedIn, Meta, Twitter', '🖼️', 'Image'],
    ['APAC Merchant Success Stories', 'https://drive.google.com/', 'Video testimonials and written case studies', '🎬', 'Video'],
  ]);

  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 360);
}

function buildOnboarding(ss) {
  const sheet = createTab(ss, 'onboarding');
  const headers = ['title', 'url', 'description', 'icon'];
  formatHeader(sheet, headers);

  addNote(sheet, 2, 'Link to Vault page, Google Doc, or internal resource');
  addNote(sheet, 4, 'Optional emoji. Leave blank for default.');

  addRows(sheet, [
    ['APAC Marketing — New Starter Guide', 'https://vault.shopify.io/', 'First 30/60/90 days checklist and key contacts', '👋'],
    ['How to Access Marketing Tools', 'https://vault.shopify.io/', 'Looker, Salesforce, Asana, Slack — getting access', '🔑'],
    ['Campaign Briefing Process', 'https://vault.shopify.io/', 'Step-by-step guide from idea to live campaign', '📋'],
    ['APAC Brand & Tone of Voice', 'https://vault.shopify.io/', 'Writing guidelines for APAC markets', '✍️'],
    ['Requesting Creative Support', 'https://vault.shopify.io/', 'How to submit a creative brief and timelines', '🎨'],
    ['Understanding APAC Markets', 'https://vault.shopify.io/', 'Market overviews for ANZ, SEA, JP, IN', '🌏'],
  ]);

  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 360);
}

function buildComms(ss) {
  const sheet = createTab(ss, 'comms');
  const headers = ['title', 'url', 'description', 'icon'];
  formatHeader(sheet, headers);

  addNote(sheet, 2, 'Link to Vault, Google Doc, or Drive file');
  addNote(sheet, 4, 'Optional emoji. Leave blank for default.');

  addRows(sheet, [
    ['APAC Press Contact List', 'https://docs.google.com/', 'Journalist and media contacts by market (ANZ, SEA, JP)', '📋'],
    ['PR Guidelines — APAC', 'https://vault.shopify.io/', 'What to say (and not say) to the press', '📰'],
    ['Media Coverage Tracker', 'https://docs.google.com/', 'Log of all APAC media coverage and mentions', '📊'],
    ['Press Release Templates', 'https://docs.google.com/', 'Standard templates for product and merchant announcements', '📝'],
    ['Shopify Comms Slack Channel', 'https://shopify.slack.com/channels/apac-comms', 'Connect with the APAC comms team on Slack', '💬'],
  ]);

  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 360);
}

function buildInsights(ss) {
  const sheet = createTab(ss, 'insights');
  const headers = ['title', 'url', 'description', 'icon'];
  formatHeader(sheet, headers);

  addNote(sheet, 2, 'Link to report, Vault page, or Drive PDF');
  addNote(sheet, 4, 'Optional emoji. Leave blank for default.');

  addRows(sheet, [
    ['APAC E-Commerce Outlook 2026', 'https://drive.google.com/', 'Euromonitor annual forecast — key APAC stats', '🌏'],
    ['ANZ SMB Landscape Report', 'https://drive.google.com/', 'SMB market sizing and growth trends for ANZ', '📊'],
    ['Shopify Commerce Trends 2026', 'https://www.shopify.com/au/research', 'Annual commerce trends report — APAC highlights', '🛍️'],
    ['SEA Digital Economy Report', 'https://drive.google.com/', 'Google-Temasek-Bain annual SEA digital economy report', '💡'],
    ['APAC Consumer Sentiment H1 2026', 'https://drive.google.com/', 'Internal survey results — consumer confidence and spend intent', '📋'],
  ]);

  sheet.setColumnWidth(1, 280);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 360);
}

function buildAiTools(ss) {
  const sheet = createTab(ss, 'ai_tools');
  const headers = ['title', 'url', 'description', 'icon'];
  formatHeader(sheet, headers);

  addNote(sheet, 2, 'Direct link to the tool or its documentation');
  addNote(sheet, 4, 'Optional emoji. Leave blank for default.');

  addRows(sheet, [
    ['Shoppe-E', 'https://shoppe-e.shopify.io/', 'AI merchant research assistant — prep for any meeting', '🤖'],
    ['Cursor AI', 'https://cursor.com/', 'AI-powered IDE for editing the marketing hub and other code', '⌨️'],
    ['Minerva', 'https://minerva.shopify.io/', 'Internal knowledge assistant — search Vault + Guru', '🧠'],
    ['Melody', 'https://melody.shopify.io/', 'AI writing and content generation for Shopify teams', '🎵'],
    ['Sage', 'https://sage.shopify.io/', 'Internal data and analytics assistant', '📊'],
    ['Claude (Anthropic)', 'https://claude.ai/', 'General-purpose AI assistant for drafting, research, analysis', '✨'],
    ['Perplexity', 'https://www.perplexity.ai/', 'AI-powered web search for real-time market intelligence', '🔍'],
  ]);

  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 360);
}

function buildBrand(ss) {
  const sheet = createTab(ss, 'brand');
  const headers = ['title', 'url', 'description', 'icon'];
  formatHeader(sheet, headers);

  addNote(sheet, 2, 'Link to Vault, Drive, or external brand resource');
  addNote(sheet, 4, 'Optional emoji. Leave blank for default.');

  addRows(sheet, [
    ['Shopify Brand Guidelines', 'https://vault.shopify.io/', 'Official brand standards — logo, colour, typography', '✨'],
    ['APAC Tone of Voice Guide', 'https://vault.shopify.io/', 'How we write for merchants in ANZ, SEA, JP, IN', '✍️'],
    ['Logo & Asset Downloads', 'https://drive.google.com/', 'Approved Shopify logos and lockups for APAC', '🖼️'],
    ['Presentation Templates', 'https://drive.google.com/', 'On-brand slide decks for pitches and partner events', '📊'],
    ['Social Media Guidelines', 'https://vault.shopify.io/', 'Do\'s and don\'ts for Shopify social channels', '📱'],
    ['Photography Style Guide', 'https://vault.shopify.io/', 'Visual direction for campaign photography', '📷'],
    ['Brand Review Request Process', 'https://vault.shopify.io/', 'How to get brand review for content and creative', '✅'],
  ]);

  sheet.setColumnWidth(1, 240);
  sheet.setColumnWidth(2, 280);
  sheet.setColumnWidth(3, 360);
}
