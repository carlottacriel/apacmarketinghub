/**
 * APAC Marketing Hub — Configuration
 *
 * ─── HOW TO UPDATE ──────────────────────────────────────────────────────────
 *
 * 1. FIRST TIME SETUP — Create the master Google Sheet:
 *    a) Go to https://script.google.com → New project
 *    b) Paste the contents of setup/CreateMasterSheet.gs
 *    c) Run → createMasterSheet (grant permissions when asked)
 *    d) Copy the Sheet ID shown in the popup → paste into MASTER_SHEET_ID below
 *
 * 2. APPS SCRIPT — Set up the live data bridge:
 *    a) Open the master sheet → Extensions → Apps Script
 *    b) Paste the contents of appsscript/Code.gs
 *    c) Set MASTER_SHEET_ID in Code.gs to match the one below
 *    d) Deploy → New deployment → Web App → Execute as Me → Anyone at Shopify
 *    e) Copy the Web App URL → paste into APPS_SCRIPT_URL below
 *
 * 3. CONTENT UPDATES — No code needed:
 *    Open the master sheet and edit any tab directly.
 *    Changes show live on the hub within seconds (no redeploy needed).
 *
 * 4. LINKS & DASHBOARDS — Update the sections below with real URLs.
 *
 * ────────────────────────────────────────────────────────────────────────────
 */

const CONFIG = {

  // ── Master Google Sheet ID ─────────────────────────────────────────────────
  // From your Sheet URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
  // Run setup/CreateMasterSheet.gs to create this sheet automatically.
  // Tactic calendar (#tactic-tracker) reads tab NEW_Calendar_TEMPLATE via Apps Script
  // (see appsscript/Code.gs → TACTICS_TAB_NAME) or GViz/CSV fallbacks in tracker/index.html.
  MASTER_SHEET_ID: '1iXiwUD4TMb-37LsE-rTgfPsUMQ0BOa5bexxMNi8HamA',

  // ── Apps Script Web App URL ────────────────────────────────────────────────
  // REQUIRED for tactic tracker on Quick/IAP: fetch() to Sheets is blocked; paste Web App URL here.
  // Sheet → Extensions → Apps Script → paste appsscript/Code.gs → Deploy → New deployment → Web App →
  //   Execute as: Me  |  Who has access: Anyone (even anonymous) → Copy URL (/exec) → paste below.
  // After changing Code.gs, create a new deployment so JSONP/callback updates apply.
  APPS_SCRIPT_URL: '',

  // ── Slack Channels ─────────────────────────────────────────────────────────
  // Displayed on the Home page as quick-access chips.
  SLACK_CHANNELS: [
    {
      name: 'apac-marketing',
      label: 'APAC Marketing',
      url: 'https://shopify.slack.com/channels/apac-marketing',
    },
    {
      name: 'apac-comms',
      label: 'APAC Comms',
      url: 'https://shopify.slack.com/channels/apac-comms',
    },
    {
      name: 'apac-campaigns',
      label: 'APAC Campaigns',
      url: 'https://shopify.slack.com/channels/apac-campaigns',
    },
    {
      name: 'anz-marketing',
      label: 'ANZ Marketing',
      url: 'https://shopify.slack.com/channels/anz-marketing',
    },
    // Add more channels here
  ],

  // ── 🔥 Hot This Week — 3 highlights shown on the home page ────────────────
  // Update these whenever you want to surface key moments for the team.
  // Fields: emoji, title, desc, link (optional — leave '' to make it non-clickable)
  HOT_THIS_WEEK: [
    {
      emoji: '🚀',
      title: 'Q2 Planning Kickoff',
      desc: 'APAC-wide campaign planning session kicking off — share your briefs by April 3.',
      link: '',
    },
    {
      emoji: '📣',
      title: 'Shopify Unite ANZ',
      desc: 'Merchant summit — April 15–16, Sydney. Registration now open.',
      link: '',
    },
    {
      emoji: '📊',
      title: 'Q1 Results Review',
      desc: 'Q1 performance review all-hands on April 8. Check the Performance Dashboard for prep.',
      link: '',
    },
  ],

  // Linked from the home page announcements feed header
  ANNOUNCEMENTS_CHANNEL_URL: 'https://shopify.slack.com/channels/apac-marketing',

  // ── Key Links ──────────────────────────────────────────────────────────────
  LINKS: {
    orgChart:     'YOUR_ORG_CHART_URL_HERE',    // Vault, Slides, or Drive link
    okrDoc:       'YOUR_OKR_DOC_URL_HERE',      // Vault or Google Sheet link
    tacticTracker: 'https://apacmarketinghub.quick.shopify.io/#tactic-tracker',
  },

  // ── Looker / Dashboard Embeds ──────────────────────────────────────────────
  // Use the Looker Studio "Embed report" URL (File → Embed report → copy URL)
  DASHBOARDS: {
    keyStats:        '',  // Embed URL for the Key Stats dashboard
    performance:     '',  // Embed URL for the Performance Dashboard
    campaignDeepDive:'',  // Embed URL for the Campaign Deep Dive dashboard
  },

  // ── Org Chart ──────────────────────────────────────────────────────────────
  // Edit entries below to update the team directory. Run `quick deploy` after saving.
  // To switch to Google Sheets as the live source, paste your Apps Script URL into
  // APPS_SCRIPT_URL above — this array will then only be used as a fallback.
  //
  // region options:   'ANZ' | 'Japan' | 'GCR' | 'India' | 'Southeast Asia' | 'ROA' | 'APAC'
  // category options: 'Leaders' | 'Brand & Content' | 'Programs + Distribution' | 'Events' | 'Partner Marketing'
  ORG_CHART: [

    // ── Leaders ───────────────────────────────────────────────────────────
    {
      name:     'Nadine Coady',
      title:    'Director, Commercial',
      region:   'APAC',
      category: 'Leaders',
      slack:    'Nadine Coady',
      vault:    'https://vault.shopify.io/users/16940-Nadine-Coady',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/0abkc4225zknl9so7ig20w8levrf.webp',
      desc:     '',
    },
    {
      name:     'Beth Carter',
      title:    'Manager, Event Marketing',
      region:   'APAC',
      category: 'Leaders',
      slack:    'beth.carter',
      vault:    'https://vault.shopify.io/users/10104-Beth-Carter',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/u08cqhqiyxnk8uv9lcxltv5tssz7.webp',
      desc:     '',
    },
    {
      name:     'Yeemun Tsang',
      title:    'Manager, Partner Marketing',
      region:   'APAC',
      category: 'Leaders',
      slack:    'Yee',
      vault:    'https://vault.shopify.io/users/7777-Yeemun-Tsang',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/guta2sawwm3pyp1hbknij822kgfd.webp',
      desc:     '',
    },

    // ── ANZ ───────────────────────────────────────────────────────────────
    {
      name:     'Shalini Karthikeyan',
      title:    'Regional Marketing Lead - Brand & Content',
      region:   'ANZ',
      category: 'Brand & Content',
      slack:    'shalini.keyan',
      vault:    'https://vault.shopify.io/users/35113-Shalini-Karthikeyan',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/t2xjl7mnr0w2gt3zbdnwv65v1erf.webp',
      desc:     'Leads brand, content and messaging strategy for ANZ. Drives always-on amplification across paid, owned and earned channels.',
    },
    {
      name:     'Daniela Solomon',
      title:    'Regional Marketing Lead - Programs',
      region:   'ANZ',
      category: 'Programs + Distribution',
      slack:    'DaniDaniBills',
      vault:    'https://vault.shopify.io/users/31344-Daniela-Solomon',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/s9ze2p5a57l7xb05ugof6neuzz7s.webp',
      desc:     'Leads ABM strategy and executes demand gen programs — webinars, roundtables, LinkedIn and gifting for ANZ.',
    },
    {
      name:     'Gabby Song',
      title:    'Events Lead - 1P Events',
      region:   'ANZ & ROA',
      category: 'Events',
      slack:    'GABfest',
      vault:    'https://vault.shopify.io/users/9212-Gabby-Song',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/ewqpdj9at8zogdsutd5w1gr90ij3.png',
      desc:     'Manages first-party events across ANZ and ROA — supporting awareness, pipeline creation and funnel acceleration.',
    },
    {
      name:     'Carlotta Criel',
      title:    'Events Lead - 3P Events',
      region:   'ANZ & ROA',
      category: 'Events',
      slack:    'carlotta.criel',
      vault:    'https://vault.shopify.io/users/37859-Carlotta-Criel',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/zqh13jsvxgajcmnr2wtt7k65syfd.jpg',
      desc:     'Owns third-party event partnerships and activations across ANZ and ROA.',
    },
    {
      name:     'Britta Davies',
      title:    'Partner Marketing Manager',
      region:   'ANZ',
      category: 'Partner Marketing',
      slack:    'Britta',
      vault:    'https://vault.shopify.io/users/27508-Britta-Davies',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/w9d7mjjji27cqghx86spfyrnvzkf.webp',
      desc:     'Activates big ideas through partners — from pipeline generation to co-branded growth for ANZ.',
    },

    // ── Japan ─────────────────────────────────────────────────────────────
    {
      name:     'Aoi Tanaka',
      title:    'Regional Marketing Lead - Brand & Content',
      region:   'Japan',
      category: 'Brand & Content',
      slack:    'Aoi',
      vault:    'https://vault.shopify.io/users/31472-Aoi-Tanaka',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/l0il3uzdudcofjrfa5mbm0eoguea.webp',
      desc:     'Leads brand, content and localisation of global campaigns for Japan.',
    },
    {
      name:     'Ayumi Manabe',
      title:    'Regional Marketing Lead - Programs',
      region:   'Japan',
      category: 'Programs + Distribution',
      slack:    'ayumi.manabe',
      vault:    'https://vault.shopify.io/users/23890-Ayumi-Manabe',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/o5brgy9ksjt1fighoj1jiv0vodok.webp',
      desc:     'Leads ABM strategy and demand generation programs for Japan.',
    },
    {
      name:     'Ami Takane',
      title:    'Events Lead - 1P & 3P',
      region:   'Japan',
      category: 'Events',
      slack:    'AMI',
      vault:    'https://vault.shopify.io/users/34907-Ami-Takane',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/790d01dd9dxphkvvdn3r8899x8h3.webp',
      desc:     'Manages marketing events for Japan, supporting awareness and pipeline.',
    },
    {
      name:     'Reisa Matsuda',
      title:    'Partner Marketing Manager',
      region:   'Japan',
      category: 'Partner Marketing',
      slack:    'reisa.matsuda',
      vault:    'https://vault.shopify.io/users/37960-Reisa-Matsuda',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/g1g8bn2zvus8zmcbmj32qu1ipova.jpg',
      desc:     'Drives partner marketing programs and co-branded growth initiatives for Japan.',
    },

    // ── GCR ───────────────────────────────────────────────────────────────
    {
      name:     'Eunice Lee',
      title:    'Regional Marketing Lead - Programs + Distribution',
      region:   'GCR',
      category: 'Programs + Distribution',
      slack:    'eunice.lee',
      vault:    '',
      photo:    '',
      desc:     'Leads ABM strategy and demand generation programs for Greater China Region. Joining April 7.',
    },
    {
      name:     'Elise Li',
      title:    'Partner Marketing Manager',
      region:   'GCR',
      category: 'Partner Marketing',
      slack:    'Elise Li',
      vault:    'https://vault.shopify.io/users/19207-Elise-Li',
      photo:    'https://cdn.shopify.com/b/u2-files-production-bucket/kz958eh1clt13enp7aimq1vspign.png',
      desc:     'Leads partner marketing activations for Greater China Region.',
    },
  ],

  // ── Tactic Tracker Column Mapping ──────────────────────────────────────────
  // Only needed if you renamed the columns in the 'tactics' tab of the master sheet.
  // The defaults match exactly what CreateMasterSheet.gs creates.
  // Uncomment and edit only the ones you changed.
  TACTIC_COLUMNS: {
    name:        'Tactic Name',
    type:        'Type',
    market:      'Market',
    owner:       'Owner',
    start_date:  'Start Date',
    end_date:    'End Date',
    status:      'Status',
    brief_link:  'Brief Link',
    description: 'Description',
  },

};
