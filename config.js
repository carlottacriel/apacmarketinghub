/**
 * APAC Marketing Hub — Configuration
 *
 * HOW TO UPDATE:
 * 1. Replace YOUR_GOOGLE_SHEET_ID_HERE with the ID from your Google Sheet URL
 *    e.g. https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit
 * 2. Update the SLACK_CHANNELS array with your real Slack channel URLs
 * 3. Update LINKS with real URLs for the org chart, OKR doc, etc.
 * 4. Update DASHBOARDS with real Looker Studio embed URLs
 */

const CONFIG = {

  // ── Google Sheet ID ────────────────────────────────────────────────
  // Find this in your Google Sheet URL between /d/ and /edit
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE',

  // ── Slack Channels ─────────────────────────────────────────────────
  // Displayed on the Home page as quick-access chips
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

  // The primary announcements channel — linked from the home page feed header
  ANNOUNCEMENTS_CHANNEL_URL: 'https://shopify.slack.com/channels/apac-marketing',

  // ── Key Links ──────────────────────────────────────────────────────
  LINKS: {
    orgChart: 'YOUR_ORG_CHART_URL_HERE',          // Vault, Slides, or Drive link
    tacticTracker: 'https://apac-marketing-tracker.quick.shopify.io/',
    okrDoc: 'YOUR_OKR_DOC_URL_HERE',              // Vault or Google Sheet link
  },

  // ── Looker / Dashboard Embeds ──────────────────────────────────────
  // Use the Looker Studio "Embed report" URL (File → Embed report)
  DASHBOARDS: {
    keyStats: '',           // Embed URL for the Key Stats dashboard
    performance: '',        // Embed URL for the Performance Dashboard
    campaignDeepDive: '',   // Embed URL for the Campaign Deep Dive dashboard
  },
};
