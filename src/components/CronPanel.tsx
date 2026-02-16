import { Clock, Play, Pause, AlertCircle, CheckCircle, Timer, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from './Card';
import { CronJob, formatDuration } from '../types';
import { format, formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

interface CronPanelProps {
  jobs: CronJob[];
}

export function CronPanel({ jobs }: CronPanelProps) {
  const enabledJobs = jobs.filter(j => j.enabled);
  const errorJobs = jobs.filter(j => j.state.consecutiveErrors && j.state.consecutiveErrors > 0);
  
  // Sort by next run time
  const sortedJobs = [...jobs].sort((a, b) => {
    const aNext = a.state.nextRunAtMs || Infinity;
    const bNext = b.state.nextRunAtMs || Infinity;
    return aNext - bNext;
  });

  return (
    <Card>
      <CardHeader
        title="Scheduled Jobs"
        subtitle={`${enabledJobs.length} active / ${jobs.length} total`}
        icon={<Clock className="w-5 h-5" />}
        action={
          errorJobs.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-error-muted)] text-[var(--color-error)]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{errorJobs.length} errors</span>
            </div>
          )
        }
      />
      <CardContent noPadding>
        <div className="divide-y divide-[var(--color-border)]">
          {sortedJobs.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-muted)]">
              No cron jobs configured
            </div>
          ) : (
            sortedJobs.map((job) => (
              <CronJobRow key={job.id} job={job} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CronJobRowProps {
  job: CronJob;
}

function CronJobRow({ job }: CronJobRowProps) {
  const hasError = job.state.lastStatus === 'error';
  const isEnabled = job.enabled;
  
  return (
    <div className={clsx(
      "px-5 py-4 hover:bg-[var(--color-bg-hover)] transition-colors",
      !isEnabled && "opacity-50"
    )}>
      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          hasError ? "bg-[var(--color-error-muted)]" :
          isEnabled ? "bg-[var(--color-success-muted)]" :
          "bg-[var(--color-bg-tertiary)]"
        )}>
          {!isEnabled ? (
            <Pause className={clsx("w-5 h-5", "text-[var(--color-text-muted)]")} />
          ) : hasError ? (
            <AlertCircle className="w-5 h-5 text-[var(--color-error)]" />
          ) : (
            <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />
          )}
        </div>
        
        {/* Job info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {job.name}
            </span>
            <ScheduleBadge schedule={job.schedule} />
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]">
            {job.state.lastRunAtMs && (
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                Last: {formatDistanceToNow(job.state.lastRunAtMs, { addSuffix: true })}
              </span>
            )}
            {job.state.lastDurationMs && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {formatDuration(job.state.lastDurationMs)}
              </span>
            )}
            {hasError && job.state.lastError && (
              <span className="text-[var(--color-error)] truncate max-w-[200px]">
                {job.state.lastError.replace('Error: ', '')}
              </span>
            )}
          </div>
        </div>
        
        {/* Next run */}
        <div className="text-right hidden sm:block">
          {job.state.nextRunAtMs && isEnabled && (
            <>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {formatDistanceToNow(job.state.nextRunAtMs, { addSuffix: true })}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {format(job.state.nextRunAtMs, 'h:mm a')}
              </p>
            </>
          )}
        </div>
        
        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
      </div>
    </div>
  );
}

function ScheduleBadge({ schedule }: { schedule: CronJob['schedule'] }) {
  let label = '';
  
  if (schedule.kind === 'cron' && schedule.expr) {
    // Parse common cron expressions
    if (schedule.expr === '*/30 * * * *') label = 'Every 30m';
    else if (schedule.expr === '0 * * * *') label = 'Hourly';
    else if (schedule.expr.startsWith('0 ') && schedule.expr.includes(' * * *')) {
      const hour = parseInt(schedule.expr.split(' ')[1]);
      label = `Daily ${hour}:00`;
    }
    else if (schedule.expr.includes(' * * 5')) label = 'Weekly Fri';
    else label = schedule.expr;
  } else if (schedule.kind === 'every' && schedule.everyMs) {
    const mins = schedule.everyMs / 60000;
    if (mins < 60) label = `Every ${mins}m`;
    else label = `Every ${mins / 60}h`;
  }
  
  return (
    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
      {label || schedule.kind}
    </span>
  );
}
