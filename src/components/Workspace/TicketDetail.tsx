import { useState, useEffect } from 'react';
import { useAppState } from '../../store/index';
import { useTickets } from '../../hooks/useTickets';
import AgentOutput from './AgentOutput';
import { Bot, User, Terminal } from 'lucide-react';
import SupportOpsLogo from '../Brand/Logo';

export default function TicketDetail() {
  const { state } = useAppState();
  const { handleRunAgent, isAnalyzing } = useTickets();
  const activeTicket = state.tickets.find(t => t.id === state.activeTicketId);

  if (!activeTicket) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted">
        <div className="max-w-sm space-y-3 text-center">
          <SupportOpsLogo size={48} className="mx-auto opacity-50" />
          <h3 className="font-head font-semibold text-ink-soft">No ticket selected</h3>
          <p className="text-xs">Select a ticket from the queue to load the escalation workspace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-abyss/40 p-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="panel p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-line bg-panel-2 px-2 py-0.5 font-mono text-xs text-ink-soft">{activeTicket.id}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  { Enterprise: 'bg-amber-300/10 text-amber-200 border-amber-300/30', SME: 'bg-accent/10 text-accent-soft border-accent/30', Free: 'bg-panel-2 text-muted border-line' }[activeTicket.tier]
                }`}>{activeTicket.tier}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  { Open: 'bg-accent/10 text-accent border-accent/30', Resolved: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30', Escalated: 'bg-rose-400/10 text-rose-300 border-rose-400/30 font-semibold', 'In Progress': 'bg-sky-400/10 text-sky-300 border-sky-400/30' }[activeTicket.status]
                }`}>{activeTicket.status}</span>
              </div>
              <h2 className="pt-1 font-head text-base font-bold tracking-tight text-ink">{activeTicket.subject}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-ink-soft">
                <span className="flex items-center gap-1"><User size={12} />{activeTicket.customerName} ({activeTicket.company})</span>
                <span className="font-mono text-muted">{activeTicket.customerEmail}</span>
              </div>
            </div>
            {!activeTicket.assignedTier && (
              <button
                onClick={handleRunAgent}
                disabled={isAnalyzing}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-xs font-medium text-void shadow-[0_0_22px_-6px_rgba(255,138,61,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 disabled:bg-panel-2 disabled:text-muted disabled:shadow-none disabled:hover:translate-y-0"
              >
                <Bot size={14} className={isAnalyzing ? 'animate-spin' : ''} />
                {isAnalyzing ? 'Processing...' : 'Run AI triage agent'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="panel space-y-3 p-5">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              <User size={14} className="text-accent" />Customer Inquiry
            </h3>
            <div className="whitespace-pre-wrap rounded-lg border border-line bg-void/60 p-4 text-xs leading-relaxed text-ink-soft">
              {activeTicket.description}
            </div>
            <div className="flex items-center justify-between border-t border-line pt-2 text-[11px] text-muted">
              <span>Environment: <span className="font-mono text-[10px] text-ink-soft">{activeTicket.environment}</span></span>
            </div>
          </div>

          <div className="panel flex h-[280px] flex-col p-5">
            <div className="mb-3 flex shrink-0 items-center justify-between border-b border-line pb-3">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                <Terminal size={14} className="text-accent" />Diagnostic Logs
              </h3>
              <span className="rounded border border-line bg-panel-2 px-2 py-0.5 font-mono text-[9px] text-muted">LOG_STREAM: ACTIVE</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-line bg-void p-3 font-mono text-[10px]">
              {activeTicket.logs.map((log, i) => {
                let color = 'text-ink-soft';
                if (log.includes('SEVERE') || log.includes('FATAL') || log.includes('CRITICAL') || log.includes('ERROR')) color = 'text-rose-400';
                else if (log.includes('WARNING') || log.includes('WARN')) color = 'text-amber-300';
                else if (log.includes('DEBUG')) color = 'text-accent';
                return <div key={i} className={`break-all leading-relaxed ${color}`}>{log}</div>;
              })}
            </div>
          </div>
        </div>

        <AgentOutput ticket={activeTicket} />
      </div>
    </div>
  );
}