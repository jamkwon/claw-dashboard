// OpenClaw Data Types

export interface Session {
  key: string;
  kind: string;
  updatedAt: number;
  ageMs: number;
  sessionId: string;
  model?: string;
  contextTokens?: number;
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  percentUsed?: number;
  remainingTokens?: number;
  systemSent?: boolean;
  flags?: string[];
}

export interface SessionsData {
  path: string;
  count: number;
  sessions: Session[];
}

export interface CronJobSchedule {
  kind: string;
  expr?: string;
  tz?: string;
  everyMs?: number;
  anchorMs?: number;
}

export interface CronJobState {
  nextRunAtMs?: number;
  lastRunAtMs?: number;
  lastStatus?: 'ok' | 'error';
  lastDurationMs?: number;
  consecutiveErrors?: number;
  lastError?: string;
}

export interface CronJob {
  id: string;
  agentId?: string;
  name: string;
  enabled: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  schedule: CronJobSchedule;
  sessionTarget: string;
  wakeMode: string;
  payload: {
    kind: string;
    text?: string;
    message?: string;
    timeoutSeconds?: number;
  };
  delivery?: {
    mode: string;
    bestEffort?: boolean;
  };
  state: CronJobState;
}

export interface CronData {
  jobs: CronJob[];
}

export interface GatewayStatus {
  mode: string;
  url: string;
  reachable: boolean;
  self?: {
    host: string;
    ip: string;
    platform: string;
  };
}

export interface HeartbeatConfig {
  enabled: boolean;
  every: string;
  everyMs: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  workspaceDir: string;
  sessionsCount: number;
  lastActiveAgeMs: number;
}

export interface StatusData {
  heartbeat: {
    agents: Array<HeartbeatConfig & { agentId: string }>;
  };
  channelSummary: string[];
  sessions: {
    count: number;
    defaults: {
      model: string;
      contextTokens: number;
    };
  };
  gateway: GatewayStatus;
  gatewayService: {
    label: string;
    installed: boolean;
    runtimeShort: string;
  };
  agents: {
    defaultId: string;
    agents: AgentInfo[];
    totalSessions: number;
  };
  memoryPlugin?: {
    enabled: boolean;
  };
}

export interface DashboardData {
  sessions: SessionsData;
  cron: CronData;
  status: StatusData;
  lastUpdated: number;
}

export type SessionType = 'main' | 'subagent' | 'cron' | 'other';

export function getSessionType(key: string): SessionType {
  if (key.includes(':main:main')) return 'main';
  if (key.includes(':subagent:')) return 'subagent';
  if (key.includes(':cron:')) return 'cron';
  return 'other';
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

export function formatAge(ms: number): string {
  if (ms < 60000) return 'just now';
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
  return `${Math.floor(ms / 86400000)}d ago`;
}
