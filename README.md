# OpenClaw Dashboard

A modern, real-time monitoring dashboard for OpenClaw AI agent infrastructure.

![OpenClaw Dashboard](./docs/screenshot.png)

## Features

- **Real-time Session Monitoring** - Track active sessions, subagents, and cron jobs
- **Token Analytics** - Visualize token usage, costs, and distribution
- **Cron Job Status** - Monitor scheduled tasks, errors, and next run times
- **System Health** - Gateway status, channel connectivity, memory plugin status
- **Mobile Responsive** - Works great on all devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **date-fns** for date formatting

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Static Deployment (Cloudflare Pages, Netlify, Vercel)

The dashboard can be deployed as a static site with mock data:

```bash
npm run build
# Deploy the `dist/` folder
```

### With Live Data

To connect to a live OpenClaw gateway:

1. Set the `VITE_API_URL` environment variable to your gateway's API endpoint
2. Set `VITE_USE_MOCK=false`
3. Rebuild the dashboard

Example:
```bash
VITE_API_URL=http://localhost:18789/api VITE_USE_MOCK=false npm run build
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | API endpoint URL |
| `VITE_USE_MOCK` | `true` | Use mock data instead of live API |

## Project Structure

```
dashboard/
├── src/
│   ├── components/     # React components
│   │   ├── Layout.tsx       # Main layout with header/footer
│   │   ├── Card.tsx         # Card and stat components
│   │   ├── SessionsPanel.tsx # Session monitoring panel
│   │   ├── CronPanel.tsx    # Cron jobs panel
│   │   ├── TokenAnalytics.tsx # Token usage charts
│   │   └── SystemStatus.tsx # System health panel
│   ├── hooks/
│   │   └── useData.ts  # Data fetching hook
│   ├── types.ts        # TypeScript types
│   ├── App.tsx         # Main app component
│   └── index.css       # Global styles
├── public/             # Static assets
├── dist/               # Production build output
└── package.json
```

## API Integration

The dashboard expects the following API endpoints (when not using mock data):

- `GET /api/sessions` - Session data
- `GET /api/cron` - Cron job data  
- `GET /api/status` - System status

These map to OpenClaw CLI commands:
```bash
openclaw sessions --json
openclaw cron list --json
openclaw status --json
```

## Customization

### Colors

The color palette is defined in `src/index.css` using CSS custom properties:

```css
:root {
  --color-accent: #6366f1;     /* Primary accent (indigo) */
  --color-success: #22c55e;    /* Success state (green) */
  --color-warning: #f59e0b;    /* Warning state (amber) */
  --color-error: #ef4444;      /* Error state (red) */
}
```

### Branding

Update the logo and title in `src/components/Layout.tsx`.

## License

Private - Figmints Digital Creative

---

Built with 🦞 for claw.figmints.net
