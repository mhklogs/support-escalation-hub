import { useAppState } from '../../store/index';
import { Ticket, CheckCircle, AlertTriangle, Clock, TrendingUp, Users, Activity } from 'lucide-react';

export default function Inbox() {
  const { state } = useAppState();
  const { tickets } = state;

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const escalatedCount = tickets.filter(t => t.status === 'Escalated').length;
  const enterpriseCount = tickets.filter(t => t.tier === 'Enterprise').length;

  const stats = [
    { label: 'Open Tickets', value: openCount, icon: Ticket, color: 'text-accent border-accent/30 bg-accent/10' },
    { label: 'Resolved', value: resolvedCount, icon: CheckCircle, color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' },
    { label: 'Escalated', value: escalatedCount, icon: AlertTriangle, color: 'text-rose-400 border-rose-400/30 bg-rose-400/10' },
    { label: 'Enterprise SLA', value: enterpriseCount, icon: TrendingUp, color: 'text-amber-300 border-amber-300/30 bg-amber-300/10' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6">
      <div>
        <p className="font-head text-xs font-semibold  tracking-[0.24em] text-accent">
          command deck
        </p>
        <h2 className="mt-1 font-display text-2xl  leading-tight">Queue health</h2>
        <p className="mt-1 text-xs text-ink-soft">Real-time support queue status and SLA pressure</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`panel p-5 transition-all duration-200 hover:-translate-y-0.5 ${stat.color.split(' ')[1]}`}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-mono text-[11px]  tracking-[0.14em] text-muted">{stat.label}</p>
                  <p className="font-display text-3xl text-glow-white">{stat.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="panel p-5">
          <h3 className="mb-4 flex items-center gap-2 font-head text-xs font-bold  tracking-wider text-ink-soft">
            <Activity size={14} className="text-accent" />
            Queue Distribution
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Free Tier', count: tickets.filter(t => t.tier === 'Free').length, color: 'bg-muted' },
              { label: 'SME Tier', count: tickets.filter(t => t.tier === 'SME').length, color: 'bg-accent' },
              { label: 'Enterprise Tier', count: enterpriseCount, color: 'bg-amber-400' },
            ].map(item => {
              const pct = tickets.length > 0 ? (item.count / tickets.length) * 100 : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-soft">{item.label}</span>
                    <span className="font-mono text-muted">{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-panel-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="mb-4 flex items-center gap-2 font-head text-xs font-bold  tracking-wider text-ink-soft">
            <Users size={14} className="text-accent" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {tickets.slice(0, 4).map(t => (
              <div key={t.id} className="flex items-center gap-3 text-xs">
                <div className={`h-2 w-2 shrink-0 rounded-full ${t.status === 'Open' ? 'bg-accent' : t.status === 'Escalated' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                <span className="font-mono text-[10px] text-muted">{t.id}</span>
                <span className="flex-1 truncate text-ink-soft">{t.subject}</span>
                <span className="hidden text-[10px] text-muted sm:block">
                  <Clock size={11} className="mr-1 inline" />
                  {new Date(t.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {tickets.length === 0 && (
              <p className="py-6 text-center text-xs text-muted">No tickets yet — the queue will populate here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}