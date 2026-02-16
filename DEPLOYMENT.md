# Deployment Guide for claw.figmints.net

## Quick Deploy to Cloudflare Pages

### Option 1: Direct Upload

1. Build the dashboard:
   ```bash
   cd dashboard
   npm install
   npm run build
   ```

2. Go to [Cloudflare Pages](https://dash.cloudflare.com/pages)

3. Click "Upload assets" and select the `dist/` folder

4. Set up custom domain: `claw.figmints.net`

### Option 2: Git Integration

1. Push the `dashboard/` folder to a Git repository

2. Connect to Cloudflare Pages:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `dashboard` (if in a monorepo)

3. Configure environment variables:
   - `VITE_USE_MOCK`: `true` (for static deployment)

### Option 3: With Live Data Server

For real-time data from OpenClaw:

1. Deploy the Node.js server:
   ```bash
   cd dashboard
   npm run start
   ```

2. The server runs on port 3001 and:
   - Serves the static dashboard
   - Provides live API endpoints:
     - `/api/sessions`
     - `/api/cron`
     - `/api/status`

3. Use a reverse proxy (nginx, Cloudflare Tunnel) to expose the server.

## DNS Configuration

Add these records to your domain:

```
Type: CNAME
Name: claw
Target: <cloudflare-pages-url>.pages.dev

# Or for a server deployment:
Type: A
Name: claw
Target: <your-server-ip>
```

## Environment Variables

| Variable | Static | Live | Description |
|----------|--------|------|-------------|
| `VITE_USE_MOCK` | `true` | `false` | Use mock or live data |
| `VITE_API_URL` | N/A | `/api` | API endpoint base URL |
| `PORT` | N/A | `3001` | Server port (live mode) |

## Files to Deploy

For static deployment, only the `dist/` folder is needed:

```
dist/
├── index.html
├── _redirects        # SPA routing
├── favicon.svg
├── assets/
│   ├── index-*.js
│   ├── index-*.css
│   └── charts-*.js
```

## Security Notes

- The dashboard uses mock data by default (no sensitive info exposed)
- Live mode requires the server to have access to `openclaw` CLI
- Consider adding authentication for production deployments

## Updating

To update the dashboard:

```bash
cd dashboard
git pull  # if using git
npm install
npm run build
# Re-deploy dist/ folder
```
