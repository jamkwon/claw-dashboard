import { Server, Wifi, MessageCircle, Brain, HardDrive, Cpu, Clock, Shield } from 'lucide-react';
import { Card, CardHeader, CardContent } from './Card';
import { StatusData } from '../types';
import clsx from 'clsx';

interface SystemStatusProps {
  status: StatusData;
}

export function SystemStatus({ status }: SystemStatusProps) {
  const gateway = status.gateway;
  const service = status.gatewayService;
  const agents = status.agents;
  
  const statusItems: StatusItemProps[] = [
    {
      label: 'Gateway',
      value: gateway?.reachable ? 'Connected' : 'Disconnected',
      status: gateway?.reachable ? 'online' : 'offline',
      icon: <Server className="w-4 h-4" />,
      detail: gateway?.url || 'Unknown',
    },
    {
      label: 'Service',
      value: service?.runtimeShort?.includes('running') ? 'Running' : 'Stopped',
      status: service?.runtimeShort?.includes('running') ? 'online' : 'offline',
      icon: <Cpu className="w-4 h-4" />,
      detail: service?.label || 'Unknown',
    },
    {
      label: 'Channels',
      value: status.channelSummary?.length ? 'Active' : 'None',
      status: status.channelSummary?.length ? 'online' : 'warning',
      icon: <MessageCircle className="w-4 h-4" />,
      detail: status.channelSummary?.[0] || 'No channels',
    },
    {
      label: 'Memory',
      value: status.memoryPlugin?.enabled ? 'Enabled' : 'Disabled',
      status: status.memoryPlugin?.enabled ? 'online' : 'warning',
      icon: <Brain className="w-4 h-4" />,
      detail: 'Vector + FTS',
    },
  ];

  return (
    <Card>
      <CardHeader
        title="System Status"
        subtitle={gateway?.self?.host || 'Local'}
        icon={<Shield className="w-5 h-5" />}
      />
      <CardContent>
        <div className="space-y-4">
          {statusItems.map((item) => (
            <StatusItem key={item.label} {...item} />
          ))}
          
          {/* Agent info */}
          {agents?.agents?.[0] && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--color-text-secondary)]">Active Agent</span>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {agents.agents[0].name}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span>Sessions</span>
                <span>{agents.agents[0].sessionsCount}</span>
              </div>
            </div>
          )}
          
          {/* Host info */}
          {gateway?.self && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <HardDrive className="w-3.5 h-3.5" />
                <span>{gateway.self.platform}</span>
                <span>•</span>
                <span>{gateway.self.ip}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusItemProps {
  label: string;
  value: string;
  status: 'online' | 'offline' | 'warning';
  icon: React.ReactNode;
  detail: string;
}

function StatusItem({ label, value, status, icon, detail }: StatusItemProps) {
  const statusColors = {
    online: 'text-[var(--color-success)]',
    offline: 'text-[var(--color-error)]',
    warning: 'text-[var(--color-warning)]',
  };

  const dotColors = {
    online: 'bg-[var(--color-success)]',
    offline: 'bg-[var(--color-error)]',
    warning: 'bg-[var(--color-warning)]',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-secondary)]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
          <div className="flex items-center gap-2">
            <span className={clsx("text-sm font-medium", statusColors[status])}>
              {value}
            </span>
            <span className={clsx("w-2 h-2 rounded-full", dotColors[status])} />
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] truncate">{detail}</p>
      </div>
    </div>
  );
}

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    { id: 'refresh', label: 'Refresh Data', icon: <Clock className="w-4 h-4" /> },
    { id: 'sessions', label: 'Clear Sessions', icon: <Brain className="w-4 h-4" /> },
    { id: 'restart', label: 'Restart Gateway', icon: <Server className="w-4 h-4" /> },
  ];

  return (
    <Card>
      <CardHeader
        title="Quick Actions"
        icon={<Cpu className="w-5 h-5" />}
      />
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg",
                "bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]",
                "hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-hover)]",
                "transition-all duration-200",
                "text-sm text-[var(--color-text-secondary)]"
              )}
            >
              <span className="text-[var(--color-accent)]">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
