import { useState, useEffect, useRef } from 'react';
import { useAppState } from '../../store/index';
import { Terminal, Activity } from 'lucide-react';

const SYSTEM_LOGS = [
  { time: '09:00:00', level: 'INFO', message: 'Core system health normal. CPU limit: 41%' },
  { time: '09:01:15', level: 'INFO', message: 'Webhook outbound runner connected to Redis cluster.' },
  { time: '09:02:40', level: 'DEBUG', message: 'Auth database cluster sync completed.' },
  { time: '09:04:10', level: 'INFO', message: 'Ingress request processed (GET /api/v1/health) — 200 OK' },
  { time: '09:05:22', level: 'CRITICAL', message: 'DB Lock detected on table accounts_subscription. Locked by uncommitted session.' },
  { time: '09:06:01', level: 'ERROR', message: 'Pool connection timeout: DB threads saturated. Active: 100/100' },
  { time: '09:06:12', level: 'WARNING', message: 'Sandbox Webhook delivery to Acme Corp failed with 401' },
  { time: '09:07:05', level: 'FATAL', message: 'PSQLException: Cannot obtain connection resource. Pool exhausted.' },
  { time: '09:08:00', level: 'INFO', message: 'Inbound telemetry pipeline synced. Ready.' },
];

export default function IngressStream() {
  const { state } = useAppState();
  const [streamLogs, setStreamLogs] = useState(SYSTEM_LOGS);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [streamLogs]);

  const levelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': case 'FATAL': return 'text-rose-400 font-bold';
      case 'ERROR': return 'text-rose-400';
      case 'WARNING': return 'text-amber-300';
      case 'DEBUG': return 'text-accent';
      default: return 'text-ink-soft';
    }
  };

  const activeTicket = state.tickets.find(t => t.id === state.activeTicketId);
  const ticketLogs = activeTicket?.logs || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6">
      <div>
        <p className="font-head text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          telemetry pipeline
        </p>
        <h2 className="mt-1 font-display text-2xl uppercase tracking-tight">Ingress stream</h2>
        <p className="mt-1 text-xs text-ink-soft">Live system telemetry and diagnostic log pipeline</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              <Terminal size={14} className="text-accent" />System Telemetry v2.10
            </h3>
            <span className="flex items-center gap-1 rounded border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />LIVE
            </span>
          </div>
          <div ref={streamRef} className="h-[500px] space-y-1.5 overflow-y-auto p-4 font-mono text-[10px]">
            {streamLogs.map((log, i) => (
              <div key={i} className={`leading-relaxed ${levelColor(log.level)}`}>
                <span className="text-muted">[{log.time}]</span> {log.level}: {log.message}
              </div>
            ))}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              <Activity size={14} className="text-accent" />Ticket Log Context
            </h3>
            <span className="font-mono text-[9px] text-muted">{activeTicket ? activeTicket.id : 'NO TICKET'}</span>
          </div>
          <div className="h-[500px] space-y-1.5 overflow-y-auto break-all p-4 font-mono text-[10px]">
            {ticketLogs.length > 0 ? ticketLogs.map((log, i) => {
              let color = 'text-ink-soft';
              if (log.includes('SEVERE') || log.includes('FATAL') || log.includes('CRITICAL') || log.includes('ERROR')) color = 'text-rose-400';
              else if (log.includes('WARNING') || log.includes('WARN')) color = 'text-amber-300';
              else if (log.includes('DEBUG')) color = 'text-accent';
              return <div key={i} className={`leading-relaxed ${color}`}>{log}</div>;
            }) : (
              <div className="italic text-muted">No logs for current ticket.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}