import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]",
        "shadow-lg",
        hover && "hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-hover)] transition-all duration-200 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-muted)] flex items-center justify-center">
            <span className="text-[var(--color-accent)]">{icon}</span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">{title}</h3>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function CardContent({ children, className, noPadding = false }: CardContentProps) {
  return (
    <div className={clsx(!noPadding && "p-5", className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  color?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function StatCard({ label, value, change, changeType = 'neutral', icon, color = 'default' }: StatCardProps) {
  const colorClasses = {
    default: 'from-indigo-500 to-purple-600',
    success: 'from-green-500 to-emerald-600',
    warning: 'from-yellow-500 to-orange-600',
    error: 'from-red-500 to-rose-600',
    info: 'from-blue-500 to-cyan-600',
  };

  const changeColors = {
    positive: 'text-[var(--color-success)]',
    negative: 'text-[var(--color-error)]',
    neutral: 'text-[var(--color-text-muted)]',
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">{label}</p>
            <p className="text-3xl font-bold text-[var(--color-text-primary)]">{value}</p>
            {change && (
              <p className={clsx("text-xs mt-1", changeColors[changeType])}>
                {change}
              </p>
            )}
          </div>
          {icon && (
            <div className={clsx(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
              colorClasses[color]
            )}>
              <span className="text-white">{icon}</span>
            </div>
          )}
        </div>
      </div>
      <div className={clsx("h-1 bg-gradient-to-r", colorClasses[color])} />
    </Card>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  color = 'default', 
  size = 'md',
  showLabel = false 
}: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    default: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600',
    error: 'bg-gradient-to-r from-red-500 to-rose-600',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
  };

  return (
    <div className="w-full">
      <div className={clsx(
        "w-full bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            colorClasses[color]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-[var(--color-text-muted)] mt-1 text-right">
          {percent.toFixed(0)}%
        </p>
      )}
    </div>
  );
}
