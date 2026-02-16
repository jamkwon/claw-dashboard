# Deployment Checklist for claw.figmints.net

## Pre-Deployment ✅

- [x] Research hosting options
- [x] Choose Cloudflare Pages (domain already on CF)
- [x] Create dashboard HTML/CSS/JS
- [x] Create Cloudflare Functions (API endpoints)
- [x] Create deployment scripts
- [x] Create CI/CD workflow
- [x] Document everything

## Deployment Steps (For Brad)

### Step 1: Cloudflare Pages Project (5 min)

1. **Login:** https://dash.cloudflare.com
2. **Navigate:** Workers & Pages → Create application → Pages
3. **Upload directly** (fastest option):
   - Upload the `dashboard/public/` folder
   - Project name: `claw-dashboard`
4. **OR connect Git** (for CI/CD):
   - Connect GitHub/GitLab
   - Select repository
   - Root directory: `/dashboard`
   - Build output: `/public`

### Step 2: Custom Domain (2 min)

1. In Pages project → Custom domains
2. Click "Set up a custom domain"
3. Enter: `claw.figmints.net`
4. Click "Activate domain"
5. DNS auto-configured (figmints.net is on CF)

### Step 3: Verify (1 min)

- Visit https://claw.figmints.net
- Should see the dashboard!

---

## Optional: KV for Real-Time Data

### Create KV Namespace

```bash
wrangler kv:namespace create DASHBOARD_DATA
# Note the ID returned
```

### Update wrangler.toml

Replace `YOUR_KV_NAMESPACE_ID` with actual ID.

### Set Webhook Secret

```bash
wrangler secret put WEBHOOK_SECRET
# Enter a random secret
```

---

## Automated Data Updates (Optional)

### Option 1: Manual Export

```bash
cd dashboard
./scripts/export-data.sh
```

### Option 2: OpenClaw Cron Job

```bash
openclaw cron add \
  --name "dashboard-data-export" \
  --schedule "*/10 * * * *" \
  --prompt "Read workspace status, cron jobs, and recent activity. Generate JSON for dashboard and save to dashboard/public/data/status.json"
```

---

## File Locations

```
/Users/brad/.../clawd-brad/dashboard/
├── public/index.html         ← Main dashboard
├── public/data/status.json   ← Data file
├── scripts/deploy.sh         ← Deploy command
├── INFRASTRUCTURE.md         ← Full technical docs
└── README.md                 ← Quick reference
```

---

## Testing Locally

```bash
cd dashboard
npx wrangler pages dev public --port 8788
# Open http://localhost:8788
```

Or simpler:
```bash
cd dashboard/public
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## Estimated Time: 10-15 minutes

All technical setup is complete. Brad just needs to:
1. Log into Cloudflare
2. Create Pages project
3. Add custom domain

The dashboard will be live at **claw.figmints.net** 🦞
