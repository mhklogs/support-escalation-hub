import { useState, useMemo } from 'react';
import { useAppState } from '../../store/index';
import { useTickets } from '../../hooks/useTickets';
import TicketItem from './TicketItem';
import { Search, Plus, RefreshCw } from 'lucide-react';

interface Props {
  onOpenCreate: () => void;
}

export default function TicketList({ onOpenCreate }: Props) {
  const { state, dispatch } = useAppState();
  const { isLoading } = useTickets();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTickets = useMemo(() => {
    return state.tickets.filter(t => {
      const matchSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [state.tickets, searchQuery, statusFilter]);

  return (
    <div className="flex h-[52vh] min-h-0 flex-col lg:h-full">
      <div className="shrink-0 space-y-3 border-b border-line bg-abyss/60 p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-head text-sm font-semibold text-ink">
            <span>Active Queue</span>
            <span className="rounded-full border border-line bg-panel-2 px-2 py-0.5 font-mono text-xs text-muted">
              {state.tickets.length}
            </span>
          </h2>
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-medium text-void shadow-[0_0_16px_-4px_rgba(255,138,61,0.8)] transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Plus size={14} />
            New Ticket
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-muted" size={14} />
          <input
            type="text"
            placeholder="Search tickets, customers, companies..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-line bg-void py-2 pl-9 pr-4 text-xs text-ink transition-all placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
        </div>

        <div className="flex rounded-md bg-panel-2/70 p-1 text-[10px] font-medium text-muted">
          {['All', 'Open', 'Resolved', 'Escalated'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 rounded py-1 text-center transition-all duration-200 ${
                statusFilter === s ? 'bg-accent/20 text-accent font-semibold' : 'hover:text-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 divide-y divide-line overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-8 text-center text-muted">
            <RefreshCw className="mx-auto animate-spin" size={20} />
            <p className="text-xs">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-muted">
            <p className="text-xs font-medium">No matching tickets</p>
            <p className="mt-1 text-[10px]">Adjust filters or create a custom ticket.</p>
          </div>
        ) : (
          filteredTickets.map((ticket: any) => (
            <div key={ticket.id}>
              <TicketItem
                ticket={ticket}
                isActive={state.activeTicketId === ticket.id}
                onSelect={id => dispatch({ type: 'SET_ACTIVE_TICKET', payload: id })}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}