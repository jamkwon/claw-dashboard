# Claw Dashboard Infrastructure Guide

## Domain: claw.figmints.net

### Hosting Decision: Cloudflare Pages ✅

**Why Cloudflare Pages?**

| Factor | Decision Rationale |
|--------|---------------------|
| **Domain DNS** | figmints.net already on Cloudflare (verified via SOA record) |
| **Performance** | 300+ edge locations, ~50ms TTFB globally (fastest of all options) |
| **Cost** | Unlimited bandwidth FREE, 500 builds/month free |
| **Integration** | Native Cloudflare Workers for API/real-time features |
| **Security** | Industry-leading DDoS, WAF, SSL all included |

### Comparison Summary (2025)

| Platform | Best For | Free Bandwidth | Free Builds |
|----------|----------|----------------|-------------|
| **Cloudflare Pages** ⭐ | Performance + Value | **Unlimited** | 500/month |
| Vercel | Next.js native | 100 GB | Included |
| Netlify | All-rounder | 100 GB | 300 min |
| GitHub Pages | Simplicity | 100 GB | Unlimited |

---

## Setup Instructions

### Step 1: Cloudflare Pages Project

1. Log into Cloudflare Dashboard → Pages
2. Create new project → Connect to Git (or Direct Upload)
3. Project name: `claw-dashboard`
4. Build settings:
   - Framework preset: None (static HTML)
   - Build command: `npm run build` (or leave empty for static)
   - Output directory: `public` (or `dist`)

### Step 2: DNS Configuration

In Cloudflare DNS for figmints.net:

```
Type: CNAME
Name: claw
Target: claw-dashboard.pages.dev
Proxy: ON (orange cloud)
TTL: Auto
```

Alternative (after Pages setup):
- Pages → Custom domains → Add `claw.figmints.net`
- Cloudflare will auto-configure DNS

### Step 3: SSL/Security

- SSL/TLS mode: Full (strict) ✅
- Auto HTTPS rewrites: ON
- Minimum TLS: 1.2
- Always Use HTTPS: ON

---

## Real-Time Data Integration with OpenClaw

### Option A: API Polling (Simple)

Dashboard polls a Cloudflare Worker that reads from OpenClaw:

```
Dashboard → CF Worker → OpenClaw Gateway (local)
```

**Limitation:** Gateway is loopback-only (127.0.0.1:18789)

### Option B: Cron Job Export (Recommended)

Use OpenClaw cron to periodically export dashboard data to a static JSON file:

```bash
# Add cron job to export dashboard data
openclaw cron add \
  --name "dashboard-data-export" \
  --schedule "*/5 * * * *" \
  --prompt "Export current project status, active sessions, and recent activity to dashboard/data/status.json in JSON format"
```

Dashboard fetches this static JSON.

### Option C: Webhook Push

OpenClaw triggers a Cloudflare Worker webhook on events:

```javascript
// Cloudflare Worker: /api/webhook
export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const data = await request.json();
      // Store in KV or D1
      await env.DASHBOARD_KV.put('latest', JSON.stringify(data));
      return new Response('OK');
    }
    // GET returns latest data
    const data = await env.DASHBOARD_KV.get('latest');
    return new Response(data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### Option D: Git-Based Updates

Cron job commits updated data.json to repo → triggers Pages rebuild:

```bash
# In cron prompt:
"Read current project files, sessions, and generate dashboard JSON. 
Commit to dashboard repo and push."
```

---

## Deployment Pipeline

### Manual Deploy (Wrangler CLI)

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
cd dashboard
wrangler pages deploy public --project-name=claw-dashboard
```

### GitHub Actions (CI/CD)

See `.github/workflows/deploy.yml`

Triggers:
- Push to `main` branch
- Manual workflow dispatch
- Cron schedule (e.g., hourly)

---

## Data Sources for Dashboard

### Available OpenClaw Data

| Source | Access Method | Update Frequency |
|--------|---------------|------------------|
| Project files | Read workspace files | On demand |
| Cron jobs | `openclaw cron list` | Real-time |
| Session activity | Memory files | Per session |
| Agent status | `openclaw agents` | Real-time |

### Workspace Files to Monitor

```
/Users/brad/Library/Mobile Documents/com~apple~CloudDocs/clawd-brad/
├── memory/
│   └── 2026-02-15.md          # Daily activity log
├── HEARTBEAT.md               # Current tasks
├── *.md                       # Project docs
└── transcripts/               # Processed data
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  claw.figmints.net                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────┐    ┌──────────────────────────────┐  │
│   │   Browser   │────│   Cloudflare Pages (Static)   │  │
│   └─────────────┘    └──────────────┬───────────────┘  │
│                                     │                   │
│   ┌─────────────────────────────────▼───────────────┐  │
│   │            Cloudflare Workers (API)             │  │
│   │  - /api/status → Read from KV/D1               │  │
│   │  - /api/webhook → Receive OpenClaw updates      │  │
│   └─────────────────────────────────┬───────────────┘  │
│                                     │                   │
└─────────────────────────────────────┼───────────────────┘
                                      │
                                      │ (HTTP POST)
                                      ▼
┌─────────────────────────────────────────────────────────┐
│                 Local Development Machine               │
├─────────────────────────────────────────────────────────┤
│   ┌─────────────────┐    ┌────────────────────────┐    │
│   │  OpenClaw Cron  │────│   Dashboard Exporter   │    │
│   │   (every 5m)    │    │   (generates JSON)     │    │
│   └─────────────────┘    └────────────┬───────────┘    │
│                                       │                 │
│   ┌───────────────────────────────────▼─────────────┐  │
│   │              Workspace Files                     │  │
│   │  memory/, HEARTBEAT.md, projects, etc.          │  │
│   └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. [x] Research hosting options
2. [x] Choose Cloudflare Pages
3. [ ] Create Cloudflare Pages project
4. [ ] Add CNAME record for claw.figmints.net
5. [ ] Build initial dashboard HTML/CSS/JS
6. [ ] Set up Cloudflare Worker for API
7. [ ] Configure OpenClaw cron job for data export
8. [ ] Test end-to-end deployment

---

## Quick Reference

**Cloudflare Dashboard:** https://dash.cloudflare.com
**Pages Docs:** https://developers.cloudflare.com/pages
**Wrangler CLI:** `npm install -g wrangler`
**Deploy Command:** `wrangler pages deploy public`
