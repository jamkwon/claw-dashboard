import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, Coins, Activity } from 'lucide-react';
import { Card, CardHeader, CardContent, StatCard } from './Card';
import { Session, getSessionType } from '../types';
import clsx from 'clsx';

interface TokenAnalyticsProps {
  sessions: Session[];
}

// Token costs per 1M tokens (approximate)
const TOKEN_COSTS = {
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-opus-4-5': { input: 15, output: 75 },
  'claude-haiku': { input: 0.25, output: 1.25 },
  default: { input: 3, output: 15 },
};

export function TokenAnalytics({ sessions }: TokenAnalyticsProps) {
  // Calculate totals
  const totals = sessions.reduce((acc, s) => {
    acc.totalTokens += s.totalTokens || 0;
    acc.inputTokens += s.inputTokens || 0;
    acc.outputTokens += s.outputTokens || 0;
    return acc;
  }, { totalTokens: 0, inputTokens: 0, outputTokens: 0 });

  // Calculate estimated cost
  const estimatedCost = sessions.reduce((cost, s) => {
    const model = s.model || 'default';
    const rates = TOKEN_COSTS[model as keyof typeof TOKEN_COSTS] || TOKEN_COSTS.default;
    const inputCost = ((s.inputTokens || 0) / 1000000) * rates.input;
    const outputCost = ((s.outputTokens || 0) / 1000000) * rates.output;
    return cost + inputCost + outputCost;
  }, 0);

  // Group by session type
  const byType = sessions.reduce((acc, s) => {
    const type = getSessionType(s.key);
    if (!acc[type]) acc[type] = { tokens: 0, count: 0 };
    acc[type].tokens += s.totalTokens || 0;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { tokens: number; count: number }>);

  const pieData = Object.entries(byType).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: data.tokens,
    count: data.count,
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#64748b'];

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Tokens"
          value={formatTokens(totals.totalTokens)}
          icon={<Coins className="w-5 h-5" />}
          color="default"
        />
        <StatCard
          label="Input Tokens"
          value={formatTokens(totals.inputTokens)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="info"
        />
        <StatCard
          label="Output Tokens"
          value={formatTokens(totals.outputTokens)}
          icon={<Activity className="w-5 h-5" />}
          color="success"
        />
        <StatCard
          label="Est. Cost"
          value={`$${estimatedCost.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Usage by session type */}
        <Card>
          <CardHeader
            title="Usage by Type"
            subtitle="Token distribution across session types"
            icon={<Activity className="w-5 h-5" />}
          />
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                      }}
                      formatter={(value) => [formatTokens(Number(value) || 0), 'Tokens']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[var(--color-text-muted)]">No data</p>
              )}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {entry.name} ({entry.count})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Context usage */}
        <Card>
          <CardHeader
            title="Context Usage"
            subtitle="Token usage per session"
            icon={<Coins className="w-5 h-5" />}
          />
          <CardContent>
            <div className="h-64">
              <SessionUsageChart sessions={sessions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SessionUsageChart({ sessions }: { sessions: Session[] }) {
  // Get top sessions by usage
  const topSessions = [...sessions]
    .filter(s => s.totalTokens && s.totalTokens > 0)
    .sort((a, b) => (b.totalTokens || 0) - (a.totalTokens || 0))
    .slice(0, 8)
    .map(s => ({
      name: formatSessionLabel(s.key),
      tokens: s.totalTokens || 0,
      percent: s.percentUsed || 0,
    }));

  if (topSessions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--color-text-muted)]">
        No session data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={topSessions} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis 
          type="number" 
          tickFormatter={(v) => formatTokens(v)}
          stroke="var(--color-text-muted)"
          fontSize={10}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={80}
          stroke="var(--color-text-muted)"
          fontSize={10}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          formatter={(value) => [formatTokens(Number(value) || 0), 'Tokens']}
        />
        <Bar 
          dataKey="tokens" 
          fill="url(#tokenGradient)" 
          radius={[0, 4, 4, 0]}
        />
        <defs>
          <linearGradient id="tokenGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
  return tokens.toString();
}

function formatSessionLabel(key: string): string {
  if (key.endsWith(':main')) return 'Main';
  if (key.includes(':subagent:')) return 'Sub ' + key.split(':subagent:')[1]?.slice(0, 4);
  if (key.includes(':cron:')) return 'Cron ' + key.split(':cron:')[1]?.slice(0, 4);
  return key.split(':').pop()?.slice(0, 8) || key;
}
