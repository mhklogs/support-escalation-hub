import { useEffect, useState } from 'react';
import { Sparkles, Terminal, Cpu } from 'lucide-react';

type EngineStatus = 'checking' | 'active' | 'local';

export default function Header() {
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

  return (
    <header className="bg-slate-900 border-b border-slate-800 py-3.5 px-6 flex items-center justify-between shrink-0 text-white shadow-md">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-500/10 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/20">
          <Cpu size={16} />
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
            Support Escalation Hub
            <Sparkles size={11} className="text-indigo-400" />
          </h2>
          <p className="text-[10px] text-slate-400">Autonomous AI Support OS · Escalation, KEDB & ingress telemetry</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-xs">
        {engine === 'checking' ? (
          <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-mono font-bold">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
            AI ENGINE: CHECKING...
          </span>
        ) : engine === 'active' ? (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-mono font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            AI ENGINE: ACTIVE
          </span>
        ) : (
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-mono font-bold" title="No GEMINI_API_KEY configured — analysis runs on the built-in local engine.">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            AI ENGINE: LOCAL MODE
          </span>
        )}
        <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-mono">
          <Terminal size={11} className="text-indigo-400" />
          TERMINAL_REPAIR: READY
        </span>
      </div>
    </header>
  );
}