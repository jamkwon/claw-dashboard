import { Activity, Clock, Cpu, Users, Zap } from 'lucide-react';
import { Card, CardHeader, CardContent, ProgressBar } from './Card';
import { Session, getSessionType, formatAge, SessionType } from '../types';
import clsx from 'clsx';

interface SessionsPanelProps {
  sessions: Session[];
  totalCount: number;
}

export function SessionsPanel({ sessions, totalCount }: SessionsPanelProps) {
  // Filter to show most relevant sessions
  const displaySessions = sessions
    .filter(s => s.totalTokens !== undefined || s.key.includes(':main:'))
    .slice(0, 8);

  const activeCount = sessions.filter(s => s.ageMs < 300000).length;
  const mainSession = sessions.find(s => s.key.endsWith(':main'));
  
  return (
    <Card>
      <CardHeader
        title="Active Sessions"
        subtitle={`${activeCount} active / ${totalCount} total`}
        icon={<Activity className="w-5 h-5" />}
      />
      <CardContent noPadding>
        <div className="divide-y divide-[var(--color-border)]">
          {displaySessions.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-muted)]">
              No active sessions
            </div>
          ) : (
            displaySessions.map((session, index) => (
              <SessionRow key={session.sessionId || index} session={session} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SessionRowProps {
  session: Session;
}

function SessionRow({ session }: SessionRowProps) {
  const sessionType = getSessionType(session.key);
  const percent = session.percentUsed || 0;
  
  return (
    <div className="px-5 py-4 hover:bg-[var(--color-bg-hover)] transition-colors">
      <div className="flex items-center gap-4">
        {/* Session type indicator */}
        <SessionTypeIcon type={sessionType} />
        
        {/* Session info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {formatSessionName(session.key)}
            </span>
            <SessionBadge type={sessionType} />
          </div>
          
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatAge(session.ageMs)}
            </span>
            {session.model && (
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {formatModelName(session.model)}
              </span>
            )}
          </div>
        </div>
        
        {/* Token usage */}
        <div className="w-32 hidden sm:block">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[var(--color-text-muted)]">Tokens</span>
            <span className="text-[var(--color-text-secondary)]">
              {formatTokens(session.totalTokens || 0)}
            </span>
          </div>
          <ProgressBar
            value={percent}
            color={percent > 80 ? 'error' : percent > 50 ? 'warning' : 'default'}
            size="sm"
          />
        </div>
        
        {/* Status */}
        <div className={clsx(
          "w-2 h-2 rounded-full",
          session.ageMs < 60000 ? "bg-[var(--color-success)] animate-pulse-glow" :
          session.ageMs < 300000 ? "bg-[var(--color-warning)]" :
          "bg-[var(--color-text-muted)]"
        )} />
      </div>
    </div>
  );
}

function SessionTypeIcon({ type }: { type: SessionType }) {
  const icons = {
    main: <Users className="w-4 h-4" />,
    subagent: <Cpu className="w-4 h-4" />,
    cron: <Clock className="w-4 h-4" />,
    other: <Zap className="w-4 h-4" />,
  };

  const colors = {
    main: 'bg-indigo-500/20 text-indigo-400',
    subagent: 'bg-purple-500/20 text-purple-400',
    cron: 'bg-blue-500/20 text-blue-400',
    other: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div className={clsx(
      "w-8 h-8 rounded-lg flex items-center justify-center",
      colors[type]
    )}>
      {icons[type]}
    </div>
  );
}

function SessionBadge({ type }: { type: SessionType }) {
  const labels = {
    main: 'Main',
    subagent: 'Subagent',
    cron: 'Cron',
    other: 'Other',
  };

  const colors = {
    main: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    subagent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cron: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <span className={clsx(
      "px-2 py-0.5 text-[10px] font-medium rounded-full border",
      colors[type]
    )}>
      {labels[type]}
    </span>
  );
}

function formatSessionName(key: string): string {
  if (key.endsWith(':main')) return 'Main Session';
  if (key.includes(':subagent:')) {
    const id = key.split(':subagent:')[1]?.split(':')[0] || '';
    return `Subagent ${id.slice(0, 8)}`;
  }
  if (key.includes(':cron:')) {
    const parts = key.split(':cron:')[1]?.split(':') || [];
    return parts[0] ? `Cron ${parts[0].slice(0, 8)}` : 'Cron Job';
  }
  return key.split(':').pop() || key;
}

function formatModelName(model: string): string {
  if (model.includes('sonnet')) return 'Sonnet 4';
  if (model.includes('opus')) return 'Opus 4';
  if (model.includes('haiku')) return 'Haiku';
  return model.split('/').pop()?.split('-').slice(0, 2).join(' ') || model;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}k`;
  return tokens.toString();
}
