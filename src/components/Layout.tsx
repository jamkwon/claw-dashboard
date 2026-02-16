import { ReactNode } from 'react';
import { Activity, Clock, Cpu, Terminal, Zap, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface LayoutProps {
  children: ReactNode;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated?: Date;
}

export function Layout({ children, onRefresh, isRefreshing, lastUpdated }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Background gradient */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent)'
        }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  OpenClaw Dashboard
                </h1>
                <p className="text-xs text-[var(--color-text-muted)]">
                  claw.figmints.net
                </p>
              </div>
            </div>

            {/* Status indicators */}
            <div className="hidden md:flex items-center gap-6">
              <StatusPill icon={<Zap className="w-3.5 h-3.5" />} label="Gateway" status="online" />
              <StatusPill icon={<Cpu className="w-3.5 h-3.5" />} label="Agent" status="active" />
              <StatusPill icon={<Clock className="w-3.5 h-3.5" />} label="Cron" status="running" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className={clsx(
                  "p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]",
                  "hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-hover)]",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-primary)]"
                )}
              >
                <RefreshCw className={clsx("w-4 h-4 text-[var(--color-text-secondary)]", isRefreshing && "animate-spin")} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              🦞 OpenClaw Control Dashboard
            </p>
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
              <span>Figmints Digital</span>
              <span>•</span>
              <span>v2026.2</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface StatusPillProps {
  icon: ReactNode;
  label: string;
  status: 'online' | 'offline' | 'active' | 'running' | 'error';
}

function StatusPill({ icon, label, status }: StatusPillProps) {
  const colors = {
    online: 'bg-[var(--color-success)] shadow-green-500/30',
    offline: 'bg-[var(--color-error)] shadow-red-500/30',
    active: 'bg-[var(--color-success)] shadow-green-500/30',
    running: 'bg-[var(--color-info)] shadow-blue-500/30',
    error: 'bg-[var(--color-error)] shadow-red-500/30',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
      <span className="text-[var(--color-text-secondary)]">{icon}</span>
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      <span className={clsx("w-2 h-2 rounded-full shadow-lg animate-pulse-glow", colors[status])} />
    </div>
  );
}
