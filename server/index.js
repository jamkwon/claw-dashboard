#!/usr/bin/env node

/**
 * OpenClaw Dashboard API Server
 * 
 * A simple Express server that provides API endpoints for the dashboard
 * by proxying OpenClaw CLI commands.
 * 
 * Usage:
 *   node server/index.js
 *   
 * Environment:
 *   PORT - Server port (default: 3001)
 *   OPENCLAW_CLI - Path to openclaw binary (default: openclaw)
 */

import { createServer } from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3001;
const OPENCLAW_CLI = process.env.OPENCLAW_CLI || 'openclaw';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Execute OpenClaw CLI command and return JSON
async function runOpenClawCommand(command) {
  try {
    const { stdout } = await execAsync(`${OPENCLAW_CLI} ${command} --json`, {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return JSON.parse(stdout);
  } catch (error) {
    console.error(`Error running command: ${command}`, error.message);
    throw error;
  }
}

// Cache for API responses
const cache = new Map();
const CACHE_TTL = 5000; // 5 seconds

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// API routes
const routes = {
  '/api/sessions': async () => {
    const cached = getCached('sessions');
    if (cached) return cached;
    const data = await runOpenClawCommand('sessions');
    setCache('sessions', data);
    return data;
  },
  
  '/api/cron': async () => {
    const cached = getCached('cron');
    if (cached) return cached;
    const data = await runOpenClawCommand('cron list');
    setCache('cron', data);
    return data;
  },
  
  '/api/status': async () => {
    const cached = getCached('status');
    if (cached) return cached;
    const data = await runOpenClawCommand('status');
    setCache('status', data);
    return data;
  },
  
  '/api/health': async () => {
    return { status: 'ok', timestamp: Date.now() };
  },
};

// Static file serving
function serveStatic(res, filePath) {
  const distPath = join(__dirname, '..', 'dist');
  const fullPath = join(distPath, filePath === '/' ? 'index.html' : filePath);
  
  if (!existsSync(fullPath)) {
    // SPA fallback
    const indexPath = join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(readFileSync(indexPath));
      return;
    }
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  
  const ext = fullPath.split('.').pop();
  const contentTypes = {
    'html': 'text/html',
    'js': 'application/javascript',
    'css': 'text/css',
    'json': 'application/json',
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'ico': 'image/x-icon',
  };
  
  res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
  res.end(readFileSync(fullPath));
}

// Create HTTP server
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }
  
  // API routes
  if (routes[path]) {
    try {
      const data = await routes[path]();
      res.writeHead(200, {
        ...corsHeaders,
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify(data));
    } catch (error) {
      res.writeHead(500, {
        ...corsHeaders,
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  
  // Static files
  serveStatic(res, path);
});

server.listen(PORT, () => {
  console.log(`🦞 OpenClaw Dashboard Server`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   API:     http://localhost:${PORT}/api/sessions`);
  console.log('');
  console.log('Press Ctrl+C to stop');
});
