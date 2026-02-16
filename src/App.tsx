import { Layout, SessionsPanel, CronPanel, TokenAnalytics, SystemStatus, QuickActions } from './components';
import { useDashboardData } from './hooks/useData';
import { Loader2 } from 'lucide-react';

function App() {
  const { data, isLoading, error, lastUpdated, refetch } = useDashboardData();

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
          <p className="text-[var(--color-text-muted)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-error)] mb-2">Failed to load dashboard</p>
          <p className="text-[var(--color-text-muted)] text-sm mb-4">{error.message}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sessions = data?.sessions.sessions || [];
  const cronJobs = data?.cron.jobs || [];
  const status = data?.status;

  return (
    <Layout
      onRefresh={refetch}
      isRefreshing={isLoading}
      lastUpdated={lastUpdated || undefined}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Hero metrics */}
        <section>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
            Token Analytics
          </h2>
          <TokenAnalytics sessions={sessions} />
        </section>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sessions - takes 2 columns */}
          <div className="lg:col-span-2">
            <SessionsPanel
              sessions={sessions}
              totalCount={data?.sessions.count || 0}
            />
          </div>

          {/* System status sidebar */}
          <div className="space-y-6">
            {status && <SystemStatus status={status} />}
            <QuickActions onAction={(action) => {
              console.log('Action:', action);
              if (action === 'refresh') refetch();
            }} />
          </div>
        </div>

        {/* Cron jobs */}
        <section>
          <CronPanel jobs={cronJobs} />
        </section>
      </div>
    </Layout>
  );
}

export default App;
