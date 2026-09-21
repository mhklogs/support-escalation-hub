import { useEffect, useState } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import SupportOpsLogo from '../Brand/Logo';

type EngineStatus = 'checking' | 'active' | 'local';

interface Props {
  onMenu?: () => void;
  menuOpen?: boolean;
}

export default function Header({ onMenu, menuOpen }: Props) {
  const [engine, setEngine] = useState<EngineStatus>('checking');

  useEffect(() => {
    let mounted = true;
    fetch('/api/credentials/check')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        const geminiMissing = (data.missing || []).some((c: any) => c.key === 'GEMINI_API_KEY');
        setEngine(geminiMissing ? 'local' : 'active');
      })
      .catch(() => { if (mounted) setEngine('local'); });
    return () => { mounted = false; };
  }, []);

  const engineChip =
    engine === 'checking' ? (
      <span className="rounded-md border border-line bg-panel/70 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-ink-soft flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" />
        AI PILOT: CHECKING
      </span>
    ) : engine === 'active' ? (
      <span className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-emerald-300 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        AI PILOT: ACTIVE
      </span>
    ) : (
      <span
        className="rounded-md border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-amber-300 flex items-center gap-1.5"
        title="No GEMINI_API_KEY configured — triage runs on the built-in local engine."
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        AI PILOT: LOCAL MODE
      </span>
    );

  return (
    <header className="glass-strong z-40 flex h-16 shrink-0 items-center gap-3 border-b border-line px-4 md:px-6">
      {onMenu && (
        <button
          onClick={onMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-soft transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      <div className="hidden items-center gap-3 lg:flex">
        <span className="logo-tile flex h-10 w-10 items-center justify-center">
          <SupportOpsLogo size={30} />
        </span>
        <div className="leading-none">
          <p className="font-display text-sm font-bold tracking-[0.1em] text-ink">SUPPORTOPS</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
            escalation hub
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-hidden lg:hidden">
        <SupportOpsLogo size={26} ring={false} color="#FF8A3D" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {engineChip}
        <span className="hidden items-center gap-1.5 rounded-md border border-line bg-panel/70 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-muted sm:flex">
          <Activity size={11} className="text-accent" />
          TRIAGE: READY
        </span>
      </div>
    </header>
  );
}