import { useAppState } from '../../store/index';
import { NavTab } from '../../types/index';
import { Inbox, Ticket, BookOpen, Terminal, Settings, Activity, FolderCode } from 'lucide-react';
import SupportOpsLogo from '../Brand/Logo';

const NAV_ITEMS: { id: NavTab; label: string; icon: typeof Inbox }[] = [
  { id: 'project', label: 'Project Inspector & Fixer', icon: FolderCode },
  { id: 'inbox', label: 'Dashboard', icon: Activity },
  { id: 'queue', label: 'Active Queue', icon: Ticket },
  { id: 'kedb', label: 'KEDB Library', icon: BookOpen },
  { id: 'ingress', label: 'Ingress Stream', icon: Terminal },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface Props {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const { state, dispatch } = useAppState();
  const openCount = state.tickets.filter(t => t.status === 'Open').length;
  const escalatedCount = state.tickets.filter(t => t.status === 'Escalated').length;

  const go = (id: NavTab) => {
    dispatch({ type: 'SET_NAV', payload: id });
    onClose?.();
  };

  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = state.activeNav === item.id;
        return (
          <button
            key={item.id}
            onClick={() => go(item.id)}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'border border-accent/40 bg-accent/15 text-white shadow-[0_0_20px_-6px_rgba(255,138,61,0.5)]'
                : 'border border-transparent text-ink-soft hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon
              size={16}
              className={`shrink-0 transition-transform duration-200 ${isActive ? 'text-accent' : 'group-hover:scale-110'}`}
            />
            <span className="truncate">{item.label}</span>
            {item.id === 'queue' && openCount > 0 && (
              <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-void">
                {openCount}
              </span>
            )}
            {item.id === 'inbox' && escalatedCount > 0 && (
              <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                {escalatedCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-line p-4">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        Triage online
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-abyss lg:flex">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-5">
          <span className="logo-tile flex h-10 w-10 items-center justify-center">
            <SupportOpsLogo size={30} />
          </span>
          <div className="min-w-0 leading-none">
            <p className="font-display text-sm font-bold tracking-[0.08em] text-ink">SUPPORTOPS</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
              escalation hub
            </p>
          </div>
        </div>
        {nav}
        {footer}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-void/70 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-abyss shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
              <div className="flex items-center gap-3">
                <span className="logo-tile flex h-9 w-9 items-center justify-center">
                  <SupportOpsLogo size={26} />
                </span>
                <p className="font-display text-sm font-bold tracking-[0.08em] text-ink">SUPPORTOPS</p>
              </div>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}