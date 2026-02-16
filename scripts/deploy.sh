#!/bin/bash
# deploy.sh - Manual deployment script for Claw Dashboard

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_DIR/dist"
PUBLIC_DIR="$PROJECT_DIR/public"
PROJECT_NAME="claw-dashboard"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🦞 Claw Dashboard Deployment${NC}"
echo "================================"

# Check for wrangler
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Installing Wrangler CLI...${NC}"
    npm install -g wrangler
fi

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Cloudflare:${NC}"
    wrangler login
fi

cd "$PROJECT_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Build the React app
echo -e "${YELLOW}Building React app...${NC}"
npx vite build

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    echo -e "${YELLOW}React build failed, falling back to static files...${NC}"
    DIST_DIR="$PUBLIC_DIR"
fi

# Copy static assets to dist
echo -e "${YELLOW}Copying static assets...${NC}"
cp "$PUBLIC_DIR/favicon.svg" "$DIST_DIR/" 2>/dev/null || true
cp -r "$PUBLIC_DIR/data" "$DIST_DIR/" 2>/dev/null || true

# Deploy
echo -e "${YELLOW}Deploying to Cloudflare Pages...${NC}"

if [ "$1" == "--preview" ]; then
    wrangler pages deploy "$DIST_DIR" --project-name="$PROJECT_NAME" --branch=preview
    echo -e "${GREEN}✅ Preview deployment complete!${NC}"
else
    wrangler pages deploy "$DIST_DIR" --project-name="$PROJECT_NAME"
    echo -e "${GREEN}✅ Production deployment complete!${NC}"
    echo -e "   Visit: https://claw.figmints.net"
fi
