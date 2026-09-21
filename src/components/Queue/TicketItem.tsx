import { useState } from 'react';
import { useAppState } from '../../store/index';
import { useTickets } from '../../hooks/useTickets';
import { Ticket } from '../../types/index';
import { Sparkles, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  ticket: Ticket;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export default function TicketItem({ ticket, isActive, onSelect }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const { dispatch } = useAppState();
  const { showToast } = useTickets();

  const sentimentColor = {
    Frustrated: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
    Anxious: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
    Neutral: 'border-line bg-panel-2 text-ink-soft',
    Calm: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  }[ticket.sentiment];

  const tierColor = {
    Enterprise: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
    SME: 'border-accent/30 bg-accent/10 text-accent-soft',
    Free: 'border-line bg-panel-2 text-muted',
  }[ticket.tier];

  const statusColor = {
    Open: 'border-accent/30 bg-accent/10 text-accent',
    Resolved: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    Escalated: 'border-rose-400/30 bg-rose-400/10 text-rose-300 font-semibold',
    'In Progress': 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  }[ticket.status];

  const handleQuickResolve = async () => {
    try {
      const res = await fetch('/api/agent/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id }),
      });
      if (res.ok) {
        const ticketsRes = await fetch('/api/tickets');
        const ticketsData = await ticketsRes.json();
        dispatch({ type: 'SET_TICKETS', payload: ticketsData });
        showToast(`Ticket ${ticket.id} resolved!`);
      }
    } catch {
      showToast('Error resolving ticket.');
    }
  };

  const handleQuickEscalate = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Escalated', assignedTier: 3, agentNotes: 'Manually escalated via quick action.' }),
      });
      if (res.ok) {
        const updated = await res.json();
        dispatch({ type: 'UPDATE_TICKET', payload: { ...ticket, ...updated } });
        showToast(`Ticket ${ticket.id} escalated to Tier 3.`);
      }
    } catch {
      showToast('Error escalating ticket.');
    }
  };

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-200 ${
        isActive ? 'bg-accent/5' : 'hover:bg-white/[0.03]'
      } ${isHovered ? 'shadow-sm' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isActive && <span className="absolute left-0 top-0 h-full w-0.5 bg-accent shadow-[0_0_12px_rgba(255,138,61,0.8)]" />}
      <div
        onClick={() => onSelect(ticket.id)}
        className="relative flex w-full flex-col space-y-1.5 p-4 text-left"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-medium text-muted">{ticket.id}</span>
          <span className="text-[10px] text-muted">{new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
        <h3 className="line-clamp-1 text-xs font-semibold text-ink">{ticket.subject}</h3>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-1.5">
            <span className={`rounded-full border px-1.5 py-0.5 text-[9px] ${sentimentColor}`}>{ticket.sentiment}</span>
            <span className={`rounded-full border px-1.5 py-0.5 text-[9px] ${tierColor}`}>{ticket.tier}</span>
          </div>
          <span className={`rounded-full border px-1.5 py-0.5 text-[9px] ${statusColor}`}>{ticket.status}</span>
        </div>
        <div className="flex items-center justify-between pt-0.5">
          {ticket.assignedTier ? (
            <span className="flex items-center text-[9px] font-medium text-accent">
              <Sparkles size={10} className="mr-1" />
              Assigned Tier {ticket.assignedTier}
            </span>
          ) : (
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted">Awaiting triage</span>
          )}
          <ChevronRight size={12} className={`text-muted transition-transform ${isActive ? 'text-accent' : ''}`} />
        </div>
      </div>

      {isHovered && ticket.status === 'Open' && (
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col space-y-1 transition-all duration-200">
          <button
            onClick={handleQuickResolve}
            className="rounded-md border border-line bg-panel p-1.5 text-ink-soft shadow-sm transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
            title="Quick Resolve"
          >
            <CheckCircle size={12} />
          </button>
          <button
            onClick={handleQuickEscalate}
            className="rounded-md border border-line bg-panel p-1.5 text-ink-soft shadow-sm transition-colors hover:border-rose-400/40 hover:text-rose-300"
            title="Escalate to Tier 3"
          >
            <AlertTriangle size={12} />
          </button>
        </div>
      )}
    </div>
  );
}