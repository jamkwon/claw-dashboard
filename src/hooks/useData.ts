import { useState, useEffect, useCallback } from 'react';
import { DashboardData, SessionsData, CronData, StatusData } from '../types';

// Check if we're in dev mode with backend available
const API_BASE = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || false;

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Use embedded mock data for static deployment
        const mockData = getMockData();
        setData(mockData);
      } else {
        // Try to fetch from API
        const [sessionsRes, cronRes, statusRes] = await Promise.all([
          fetch(`${API_BASE}/sessions`).catch(() => null),
          fetch(`${API_BASE}/cron`).catch(() => null),
          fetch(`${API_BASE}/status`).catch(() => null),
        ]);

        const sessions: SessionsData = sessionsRes ? await sessionsRes.json() : getMockData().sessions;
        const cron: CronData = cronRes ? await cronRes.json() : getMockData().cron;
        const status: StatusData = statusRes ? await statusRes.json() : getMockData().status;

        setData({
          sessions,
          cron,
          status,
          lastUpdated: Date.now(),
        });
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Fall back to mock data
      setData(getMockData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}

function getMockData(): DashboardData {
  const now = Date.now();
  
  return {
    sessions: {
      path: '/Users/brad/.openclaw/agents/main/sessions/sessions.json',
      count: 61,
      sessions: [
        {
          key: 'agent:main:main',
          kind: 'direct',
          updatedAt: now - 60000,
          ageMs: 60000,
          sessionId: 'main-session-id',
          model: 'claude-sonnet-4-20250514',
          contextTokens: 200000,
          totalTokens: 115080,
          inputTokens: 23000,
          outputTokens: 15900,
          percentUsed: 58,
          remainingTokens: 84920,
          systemSent: true,
        },
        {
          key: 'agent:main:subagent:dashboard-dev',
          kind: 'direct',
          updatedAt: now - 30000,
          ageMs: 30000,
          sessionId: 'subagent-1',
          model: 'claude-sonnet-4-20250514',
          contextTokens: 200000,
          totalTokens: 45000,
          percentUsed: 22,
        },
        {
          key: 'agent:main:cron:clearmud-progress',
          kind: 'direct',
          updatedAt: now - 200000,
          ageMs: 200000,
          sessionId: 'cron-1',
          model: 'claude-sonnet-4-20250514',
          contextTokens: 200000,
          totalTokens: 200000,
          inputTokens: 155,
          outputTokens: 2336,
          percentUsed: 100,
          systemSent: true,
        },
        {
          key: 'agent:main:cron:daily-status',
          kind: 'direct',
          updatedAt: now - 4000000,
          ageMs: 4000000,
          sessionId: 'cron-2',
          model: 'claude-sonnet-4-20250514',
          contextTokens: 200000,
          totalTokens: 180000,
          percentUsed: 90,
          systemSent: true,
        },
        {
          key: 'agent:main:subagent:email-agent',
          kind: 'direct',
          updatedAt: now - 120000,
          ageMs: 120000,
          sessionId: 'subagent-2',
          model: 'claude-sonnet-4-20250514',
          contextTokens: 200000,
          totalTokens: 78000,
          percentUsed: 39,
        },
      ],
    },
    cron: {
      jobs: [
        {
          id: 'clearmud-updates',
          name: 'Clearmud Strategy Status Updates',
          enabled: true,
          createdAtMs: now - 86400000,
          updatedAtMs: now - 600000,
          schedule: { kind: 'every', everyMs: 600000 },
          sessionTarget: 'main',
          wakeMode: 'now',
          payload: { kind: 'systemEvent', text: 'Check Clearmud delivery status' },
          state: {
            nextRunAtMs: now + 300000,
            lastRunAtMs: now - 600000,
            lastStatus: 'ok',
            lastDurationMs: 10526,
            consecutiveErrors: 0,
          },
        },
        {
          id: 'daily-6am',
          name: 'Daily Status Report (6AM)',
          enabled: true,
          createdAtMs: now - 604800000,
          updatedAtMs: now - 43200000,
          schedule: { kind: 'cron', expr: '0 6 * * *', tz: 'America/New_York' },
          sessionTarget: 'main',
          wakeMode: 'next-heartbeat',
          payload: { kind: 'systemEvent', text: 'Morning status report' },
          state: {
            nextRunAtMs: now + 28800000,
            lastRunAtMs: now - 57600000,
            lastStatus: 'ok',
            lastDurationMs: 0,
            consecutiveErrors: 0,
          },
        },
        {
          id: 'cmo-status',
          name: 'CMO App Status Check',
          enabled: true,
          createdAtMs: now - 604800000,
          updatedAtMs: now - 3600000,
          schedule: { kind: 'cron', expr: '0 11 * * *', tz: 'America/New_York' },
          sessionTarget: 'main',
          wakeMode: 'now',
          payload: { kind: 'systemEvent', text: 'CMO app build progress' },
          state: {
            lastRunAtMs: now - 43200000,
            lastStatus: 'error',
            lastDurationMs: 970515,
            consecutiveErrors: 1,
            lastError: 'Error: cron: job execution timed out',
          },
        },
        {
          id: 'pendant-extract',
          name: 'Daily Commitment Extraction',
          enabled: true,
          createdAtMs: now - 259200000,
          updatedAtMs: now - 21600000,
          schedule: { kind: 'cron', expr: '0 17 * * *', tz: 'America/New_York' },
          sessionTarget: 'isolated',
          wakeMode: 'now',
          payload: { kind: 'agentTurn', message: 'Extract commitments from Pendant API' },
          state: {
            nextRunAtMs: now + 64800000,
            lastRunAtMs: now - 21600000,
            lastStatus: 'ok',
            lastDurationMs: 583547,
            consecutiveErrors: 0,
          },
        },
        {
          id: 'linkedin-weekly',
          name: 'LinkedIn Weekly Report',
          enabled: true,
          createdAtMs: now - 1209600000,
          updatedAtMs: now - 172800000,
          schedule: { kind: 'cron', expr: '0 17 * * 5', tz: 'America/New_York' },
          sessionTarget: 'main',
          wakeMode: 'now',
          payload: { kind: 'systemEvent', text: 'Weekly LinkedIn outreach report' },
          state: {
            nextRunAtMs: now + 432000000,
            lastRunAtMs: now - 172800000,
            lastStatus: 'ok',
            lastDurationMs: 30585,
            consecutiveErrors: 0,
          },
        },
      ],
    },
    status: {
      heartbeat: {
        agents: [{ agentId: 'main', enabled: true, every: '1h', everyMs: 3600000 }],
      },
      channelSummary: ['iMessage: configured', '  - default'],
      sessions: {
        count: 61,
        defaults: {
          model: 'claude-sonnet-4-20250514',
          contextTokens: 200000,
        },
      },
      gateway: {
        mode: 'local',
        url: 'ws://127.0.0.1:18789',
        reachable: true,
        self: {
          host: 'jamess-Mac-mini.local',
          ip: '192.168.86.36',
          platform: 'macos 26.2 (arm64)',
        },
      },
      gatewayService: {
        label: 'LaunchAgent',
        installed: true,
        runtimeShort: 'running (pid 85391, state active)',
      },
      agents: {
        defaultId: 'main',
        agents: [
          {
            id: 'main',
            name: 'main',
            workspaceDir: '/Users/brad/Library/Mobile Documents/com~apple~CloudDocs/clawd-brad',
            sessionsCount: 61,
            lastActiveAgeMs: 23706,
          },
        ],
        totalSessions: 61,
      },
      memoryPlugin: {
        enabled: true,
      },
    },
    lastUpdated: now,
  };
}
