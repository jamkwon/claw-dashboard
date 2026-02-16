# Claw Dashboard - Technical Architecture

## Overview

**Live URL:** https://claw.figmints.net  
**Hosting:** Cloudflare Pages  
**Stack:** React + TypeScript + Tailwind CSS + Vite

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    claw.figmints.net                             │
│                    (Cloudflare Pages)                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   React Dashboard                           ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐││
│  │  │ Sessions │  │  Cron    │  │  Token   │  │   System     │││
│  │  │  Panel   │  │  Panel   │  │ Analytics│  │   Status     │││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │               /data/status.json (Static)                    ││
│  │         or   /api/status (Cloudflare Worker)                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Data Sources
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Local Development Machine                       │
│                  (james's Mac mini / Brad's Mac)                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐ │
│  │    OpenClaw    │    │   Cron Jobs    │    │   Workspace    │ │
│  │    Gateway     │    │   Scheduler    │    │     Files      │ │
│  │  :18789 (local)│    │                │    │                │ │
│  └────────────────┘    └────────────────┘    └────────────────┘ │
│         │                      │                     │           │
│         └──────────────────────┴─────────────────────┘           │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Data Export Script                        ││
│  │           (scripts/export-data.sh or cron job)              ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │     Push to Cloudflare (wrangler / git commit & CI/CD)      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
dashboard/
├── src/                          # React source code
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Tailwind + custom styles
│   ├── types.ts                  # TypeScript interfaces
│   ├── components/
│   │   ├── Layout.tsx            # Page layout
│   │   ├── Card.tsx              # Reusable card component
│   │   ├── CronPanel.tsx         # Cron jobs table
│   │   ├── SessionsPanel.tsx     # Active sessions
│   │   ├── TokenAnalytics.tsx    # Token usage charts
│   │   └── SystemStatus.tsx      # Gateway/agent status
│   └── hooks/
│       └── useData.ts            # Data fetching hooks
├── public/
│   ├── index.html                # Static fallback
│   ├── favicon.svg               # Site icon
│   └── data/
│       └── status.json           # Dashboard data
├── functions/                    # Cloudflare Pages Functions
│   └── api/
│       ├── status.js             # GET /api/status
│       └── webhook.js            # POST /api/webhook
├── scripts/
│   ├── deploy.sh                 # Manual deployment
│   └── export-data.sh            # Data export
├── .github/workflows/
│   └── deploy.yml                # CI/CD pipeline
├── dist/                         # Built files (deploy this)
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── wrangler.toml                 # Cloudflare configuration
```

---

## Data Flow

### Option A: Static JSON (Current Implementation)

1. **Export:** Run `scripts/export-data.sh` or OpenClaw cron job
2. **Build:** `npm run build` → generates `dist/`
3. **Deploy:** `wrangler pages deploy dist/`
4. **Fetch:** Dashboard reads `/data/status.json`

### Option B: Real-Time via Workers

1. **Webhook:** OpenClaw POSTs to `/api/webhook`
2. **Store:** Worker saves to KV storage
3. **Fetch:** Dashboard reads `/api/status`

### Option C: Git-Based CI/CD

1. **Cron:** OpenClaw commits updated `data/status.json`
2. **Push:** Git push triggers GitHub Actions
3. **Build:** CI builds React app
4. **Deploy:** CI deploys to Cloudflare Pages

---

## Data Types

```typescript
// Key interfaces from src/types.ts

interface Session {
  key: string;
  kind: string;
  sessionId: string;
  model?: string;
  contextTokens?: number;
  totalTokens?: number;
  percentUsed?: number;
}

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: 'cron' | 'every';
    expr?: string;
    everyMs?: number;
  };
  state: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: 'ok' | 'error';
  };
}

interface StatusData {
  gateway: {
    mode: string;
    url: string;
    reachable: boolean;
  };
  sessions: {
    count: number;
    defaults: { model: string; contextTokens: number };
  };
  agents: {
    defaultId: string;
    agents: AgentInfo[];
  };
}
```

---

## Deployment Commands

### Quick Deploy

```bash
cd dashboard
npm run deploy
```

### Manual Steps

```bash
# Install dependencies
npm install

# Build React app
npm run build

# Deploy to Cloudflare
wrangler pages deploy dist --project-name=claw-dashboard
```

### Local Development

```bash
# Start dev server (with hot reload)
npm run dev
# → http://localhost:5173

# Preview production build
npm run preview
```

---

## Environment Setup

### Required Secrets (for CI/CD)

| Secret | Description | Where to Get |
|--------|-------------|--------------|
| `CLOUDFLARE_API_TOKEN` | API token with Pages permissions | CF Dashboard → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID | CF Dashboard URL or API |

### Optional: KV Namespace

```bash
# Create KV for real-time data
wrangler kv:namespace create DASHBOARD_DATA

# Add to wrangler.toml:
# [[kv_namespaces]]
# binding = "DASHBOARD_DATA"
# id = "<returned-id>"
```

---

## OpenClaw Integration

### Export Data via Cron

```bash
openclaw cron add \
  --name "dashboard-data-export" \
  --schedule "*/10 * * * *" \
  --prompt "Read sessions, cron jobs, gateway status. Generate JSON matching DashboardData interface. Save to dashboard/public/data/status.json"
```

### Available OpenClaw Commands

```bash
# Get sessions
openclaw sessions list --json

# Get cron jobs
openclaw cron list --json

# Get gateway status
openclaw gateway status

# Get agent info
openclaw agents list --json
```

---

## Performance Notes

- **Initial Load:** ~170KB gzipped (React + Recharts)
- **Data Refresh:** Every 30 seconds
- **CDN:** Cloudflare's 300+ edge locations
- **TTFB:** ~50ms globally

### Bundle Optimization

Large chunk warning can be addressed by:
- Dynamic imports for Recharts
- Code splitting per route
- Tree-shaking unused icons

---

## Security

- **CORS:** Configured in `wrangler.toml`
- **CSP:** Add via Cloudflare Page Rules
- **Auth:** Optional webhook secret for `/api/webhook`
- **SSL:** Automatic via Cloudflare

---

## Monitoring

### Cloudflare Analytics

- Real User Monitoring (RUM)
- Web Vitals
- Error tracking

### OpenClaw Health

- Check cron job status
- Monitor session counts
- Track token usage

---

## Future Enhancements

1. **WebSocket updates** - Real-time without polling
2. **Auth layer** - Cloudflare Access for private dashboard
3. **Mobile app** - React Native version
4. **Alerts** - Push notifications for errors
5. **Historical data** - D1 database for trends
