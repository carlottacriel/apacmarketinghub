# APAC Marketing Hub

A light-themed internal hub for the Shopify APAC Marketing team.

**Live site:** https://apacmarketinghub.quick.shopify.io/
**Master sheet:** _(paste link after setup)_
**Tactic tracker sheet:** https://docs.google.com/spreadsheets/d/1iXiwUD4TMb-37LsE-rTgfPsUMQ0BOa5bexxMNi8HamA/edit

---

## For the team: How to update content

All content is managed in **Google Sheets**. No code or GitHub access needed.

Ask the hub maintainer for **Editor** access to the master sheet. Anyone with Editor access can update rows — **no GitHub, no Apps Script, no deploy** for routine changes.

### Calendar (Friday / weekly updates)

The live tactic calendar reads tab **`NEW_Calendar_TEMPLATE`** in the same master sheet. Regional leads update rows there (status, dates, owners, links). Changes appear on the hub on the next page refresh — **you do not touch the repo** for those edits.

**Apps Script is not something editors run weekly.** It is optional infrastructure (deploy once) that lets the hosted site fetch sheet data when anonymous CSV access is unreliable. One maintainer deploys or redeploys it when code changes; **everyone else only edits the Sheet.**

### Sheet tabs → Hub sections

| Sheet tab | Updates this section |
|---|---|
| `NEW_Calendar_TEMPLATE` | Calendar / tactic tracker (live marketing activities) |
| `announcements` | Home page feed |
| `key_stats` | Key Stats — metric numbers |
| `campaigns` | Campaign Deep Dive |
| `competitive` | Market Insights + Competitor |
| `resources` | Account Insights |
| `okrs` | Mktg Strategy + OKRs |
| `assets` | Content Repository |
| `onboarding` | Self-Serve Guides |
| `comms` | Comms + PR |
| `ai_tools` | Useful Agents + Tools |
| `brand` | Be a Brand Champion |

Most tabs use the same column structure: `title · url · description · icon`

---

## 🔥 Hot This Week — how to update

Open `config.js` and edit the `HOT_THIS_WEEK` array. Each item has:

```js
{
  emoji: '🚀',
  title: 'Q2 Planning Kickoff',
  desc: 'APAC-wide planning session — April 3',
  link: '',          // optional URL — leave '' if not clickable
}
```

Changes go live after the next `quick deploy`.

---

## 👥 Org Chart — template & requirements

The Org Chart is managed in the **`org_chart` tab of the master sheet** (same sheet as everything else).

Once the master sheet is set up (see Setup below), open it → click the `org_chart` tab → edit directly.

### Required columns (row 1 = headers, row 2+ = team members)

| Column header | Required? | Description |
|---|---|---|
| `Name` | ✅ Yes | Full name — shown on the card and used for the initial avatar fallback |
| `Title` | ✅ Yes | Job title / role (e.g. "Senior Marketing Manager, ANZ") |
| `Photo URL` | Recommended | Direct URL to a headshot image. See photo tips below. |
| `Slack Handle` | Recommended | Slack username **without** the @ (e.g. `shalini.keyan`). Links to their Slack profile. |
| `Description` | Recommended | 1–2 sentence bio or focus area (e.g. "Leads ANZ enterprise campaigns and partner events") |
| `Vault URL` | Recommended | Their Vault profile URL — clicking their name opens this |

> **Column names are flexible.** The hub also recognises: `Role`, `Photo`, `Slack`, `Bio`, `About`, `Profile`, `Vault Profile`. If you rename a column, the hub will still find it automatically as long as the meaning is the same.

### Photo URL tips

- Use a **Google Drive** direct link: upload the photo → Share → "Anyone with link can view" → copy the share URL → convert to direct format:
  `https://drive.google.com/uc?export=view&id=FILE_ID`
- Or use a **Shopify People directory** headshot URL if available.
- If left blank, the hub shows a green circle with the person's initial.

### Slack handle tips

- Enter the handle **without** the `@` sign (e.g. `carlotta.criel`, not `@carlotta.criel`).
- This links directly to their Slack profile at `shopify.slack.com/team/HANDLE`.

### Vault URL tips

- Go to `vault.shopify.io` → search for the person → copy their profile URL.
- Format: `https://vault.shopify.io/people/FIRSTNAME-LASTNAME`

### When someone joins or leaves

**Adding a new person:**
1. Open the "Org Chart" tab in the tactic tracker sheet
2. Add a new row with all 6 columns filled in
3. The hub updates automatically on next page load (no deployment needed)

**Removing someone:**
1. Delete their row entirely (don't leave the row blank — blank rows are skipped)

**When someone changes role:**
1. Edit their `Title` and `Description` cells directly in the sheet

### Visual format (for reference)

Each card displays in this order:
```
[circular photo or initial]
Name ← linked to Vault profile
Job Title
@slack-handle ← links to Slack
Description
```

Cards appear in the same order as rows in the sheet. Put the most senior person first, or sort alphabetically — your call.

---

## For maintainers: Setup & deployment

### Tech stack

| Layer | Tool |
|---|---|
| Hosting | Shopify Quicksite (`apacmarketinghub.quick.shopify.io`) |
| Content | One master Google Sheet (all tabs in one place) |
| Data bridge | Prefer **Apps Script Web App** (`APPS_SCRIPT_URL` in `config.js`) for the tactic tracker on Quick; fallback options include **Publish to web** CSV where policy allows |
| Code | Vanilla HTML / CSS / JS — no framework |

### First-time setup (do this once)

**Step 1 — Create the master sheet**
1. Go to [script.google.com](https://script.google.com) → **New project**
2. Paste the contents of `setup/CreateMasterSheet.gs` into the editor
3. Click **Run → createMasterSheet** (grant permissions when asked)
4. A popup will show the **Sheet ID** — copy it

The script creates all tabs automatically, including `org_chart`, `tactics`, `announcements`, and all content tabs, with sample data and headers.

**Step 2 — Publish the sheet for public access**

In the new sheet:
1. **File → Share → Share with others** → change to **"Anyone with the link" → Viewer** → Done
2. **File → Share → Publish to web** → select **"Entire document"** → **CSV** → **Publish** → confirm

Both steps are required. Step 1 lets the hub fetch data. Step 2 makes CSV export work.

**Step 3 — Update config.js**

Open `config.js` and paste your Sheet ID:
```js
MASTER_SHEET_ID: 'PASTE_YOUR_SHEET_ID_HERE',
```

Also update these when you have the links:
```js
DASHBOARDS: {
  keyStats:        '',   // Looker Studio embed URL
  performance:     '',   // Looker Studio embed URL
  campaignDeepDive:'',   // Looker Studio embed URL
},
```

**Step 4 — Deploy to Quicksite**
```bash
quick deploy "/Users/shalini.keyan/Cursor Workspaces/outline/apac-marketing-hub" apacmarketinghub
```
When prompted, type `apacmarketinghub` exactly.

### Ongoing deployments (after code changes)

Same command as Step 4. Content changes (Google Sheet edits) **don't** require a redeploy.

### Who manages what

| Task | Who | Tool |
|---|---|---|
| Update calendar rows (weekly / Friday) | Anyone with **Editor** on the master sheet | Tab `NEW_Calendar_TEMPLATE` — no repo |
| Update content (links, descriptions, resources) | Anyone on the team | Google Sheets — Editor access |
| Update "Hot This Week" highlights | Marketing leads / hub maintainer | `config.js` → redeploy |
| Add/remove team members in Org Chart | Marketing leads | `org_chart` tab (or `Org chart`) in master sheet |
| Code or layout changes | Hub maintainers / devs | Cursor → `quick deploy` |
| Apps Script deploy / redeploy | Any maintainer with access to the Apps Script project | Google Apps Script — **only when API code or deployment settings change**, not for weekly content |

---

## File structure

```
apac-marketing-hub/
├── index.html          ← All HTML — welcome banner, tabs, section content
├── styles.css          ← Shopify green light theme + all component styles
├── app.js              ← Navigation, data fetching, renderers
├── config.js           ← Sheet ID, Apps Script URL, Slack channels, Hot This Week
├── README.md           ← This file
├── appsscript/
│   └── Code.gs         ← Google Apps Script — JSON API for sheet data
└── setup/
    └── CreateMasterSheet.gs  ← One-time script to create the master sheet
```
