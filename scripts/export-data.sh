#!/bin/bash
# export-data.sh - Export OpenClaw data for dashboard
# Run via cron or manually

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_DIR/public/data"
WORKSPACE="/Users/brad/Library/Mobile Documents/com~apple~CloudDocs/clawd-brad"

mkdir -p "$DATA_DIR"

# Generate status.json
cat > "$DATA_DIR/status.json" << EOF
{
  "generated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "hostname": "$(hostname)",
  "gateway": {
    "status": "$(openclaw gateway status 2>&1 | grep "Runtime:" | awk '{print $2}')",
    "port": 18789
  },
  "cron_jobs": $(openclaw cron list --json 2>/dev/null || echo "[]"),
  "workspace": "$WORKSPACE",
  "files": {
    "heartbeat": "$(cat "$WORKSPACE/HEARTBEAT.md" 2>/dev/null | head -20 | jq -Rs .)",
    "memory_today": "$(cat "$WORKSPACE/memory/$(date +%Y-%m-%d).md" 2>/dev/null | tail -50 | jq -Rs .)"
  }
}
EOF

echo "Data exported to $DATA_DIR/status.json"

# Optional: Commit and push if git repo
if [ -d "$PROJECT_DIR/.git" ]; then
    cd "$PROJECT_DIR"
    git add public/data/
    git commit -m "chore: update dashboard data $(date +%Y-%m-%d_%H:%M)" || true
    git push origin main || echo "Push failed - may need auth"
fi
