# APAC Marketing Hub

A light-themed marketing hub for the Shopify APAC team — hosted on GitHub Pages, content managed via Google Sheets.

**Live site:** [https://carlottacriel.github.io/apacmarketinghub](https://apacmarketinghub.quick.shopify.io/)

---

## For the team: How to update content

All content is managed through a shared **Google Sheet**. No code or GitHub access required.

### Step 1 — Get access to the Google Sheet

Ask Carlotta or the hub maintainer to share the Google Sheet with you as an **Editor**.

### Step 2 — Find the right tab

The sheet has one tab per section of the hub:

| Sheet Tab | Updates this section |
|---|---|
| `announcements` | Home page — Slack feed |
| `team` | Home page — Org chart cards |
| `key_stats` | Key Stats — metric numbers |
| `campaigns` | Campaign Deep Dive + Tactic Tracker |
| `competitive` | Mkt Insights + Competitive |
| `resources` | Account Insights |
| `assets` | Content Repository |
| `onboarding` | Self-Serve Guides |
| `comms` | Comms + PR |
| `insights` | Insights |
| `okrs` | Hub / OKRs |
| `ai_tools` | Useful Agents + AI Tools |
| `brand` | Be a Brand Champion |

### Step 3 — Add or edit a row

Each tab uses the same basic column structure for link cards:

| Column | Description |
|---|---|
| `title` | The name shown on the card |
| `url` | The link to open when clicked |
| `description` | Short subtitle shown under the title |
| `icon` | (Optional) Emoji to use as the card icon |
| `category` | (Optional) Used for filtering in some sections |

Changes appear on the hub within a few seconds of page refresh (no deployment needed).

---

## For the announcements feed (Slack → Hub)

The home page feed pulls from the `announcements` tab. To keep it up to date automatically:

1. Set up a **Zapier** automation:
   - **Trigger:** New message posted in your APAC Marketing Slack channel
   - **Action:** Create a new row in Google Sheet → `announcements` tab
2. Map the fields:
   - `timestamp` → Message timestamp
   - `author` → Message author name
   - `message` → Message text
   - `slack_link` → Permalink to the Slack message

---

## For maintainers: How to set up

### 1. Create the Google Sheet

Create a new Google Sheet with the tabs listed above. Share it publicly (view access for all) or use the Sheets API.

To publish for public CSV access:
- File → Share → Publish to web → Choose each tab → CSV → Publish

### 2. Update config.js

Open `config.js` and replace:

```js
SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE'
```

With the ID from your sheet URL:
```
https://docs.google.com/spreadsheets/d/REPLACE_THIS_PART/edit
```

Also update:
- `SLACK_CHANNELS` — add real channel names and URLs
- `LINKS.orgChart` — link to the org chart (Vault, Slides, or Drive)
- `LINKS.okrDoc` — link to the OKR tracker
- `DASHBOARDS.performance` — Looker Studio embed URL (File → Embed report)

### 3. Enable GitHub Pages

In the `carlottacriel/apacmarketinghub` repo:
1. Go to Settings → Pages
2. Source: Deploy from branch → `main` → `/ (root)`
3. Save — the site will be live at `https://carlottacriel.github.io/apacmarketinghub`

### 4. Push the code

```bash
git clone https://github.com/carlottacriel/apacmarketinghub.git
cd apacmarketinghub
# Copy these files into the folder
git add .
git commit -m "Initial hub build"
git push
```

---

## File structure

```
apac-marketing-hub/
├── index.html     ← All HTML structure + tab sections
├── styles.css     ← Shopify green light theme
├── app.js         ← Tab navigation + Google Sheets data fetching
├── config.js      ← Your Sheet ID, Slack channels, dashboard URLs
└── README.md      ← This file
```

---

## Who manages what

| Role | Access needed |
|---|---|
| Content updates (most of the team) | Google Sheet — Editor access |
| Code/layout changes | GitHub repo — Write (collaborator) access |
| Repo settings / GitHub Pages setup | GitHub repo — Admin (Carlotta only) |
