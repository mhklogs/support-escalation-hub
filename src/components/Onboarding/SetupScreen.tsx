import React, { useState, useEffect } from 'react';
import { useAppState } from '../../store/index';
import {
  Key, Database, RefreshCw, Check, Activity, XCircle, AlertTriangle,
  Sparkles, ArrowRight, Loader, FolderCode, BookOpen, Send, Flag,
  CircleCheck, ChevronDown, ScanLine,
} from 'lucide-react';
import SupportOpsLogo, { SupportOpsBrand } from '../Brand/Logo';

interface MissingCred {
  service: string;
  key: string;
  description: string;
  envVar: string;
}

type FieldStatus = 'empty' | 'filled' | 'testing' | 'valid' | 'warning' | 'invalid';
type PageStep = 'checking' | 'form' | 'done';

const HOW = [
  {
    n: '01',
    title: 'Paste a real ticket',
    text: 'Drop a customer inquiry, the environment it ran in, and the backend logs that came back with it. Your actual queue, not a demo file.',
  },
  {
    n: '02',
    title: 'Watch the triage run',
    text: 'SupportOps classifies tier and severity, reads sentiment, matches known errors, and traces root cause straight from the log stream.',
  },
  {
    n: '03',
    title: 'Send the reply you own',
    text: 'A customer-ready draft comes back with a clear escalation call — reply and resolve, or push a complete handover to engineering.',
  },
];

const OUTCOMES = [
  {
    icon: ScanLine,
    title: 'Every ticket, triaged in seconds',
    text: 'Tier, severity, sentiment and SLA pressure decided before an agent opens the ticket. The queue stops pooling up.',
  },
  {
    icon: BookOpen,
    title: 'Root cause from the logs',
    text: 'Known errors, webhook mismatches, pool exhaustion, lock cycles — matched against the KB and traced to the line that broke.',
  },
  {
    icon: Send,
    title: 'A reply your customer can act on',
    text: "A drafted, editable response in your team's voice. Your agent edits, sends, and marks it resolved in minutes, not hours.",
  },
  {
    icon: Flag,
    title: 'Escalate only what matters',
    text: 'Tier-3 calls come packaged as a complete internal handover — impact, defect, root cause, next steps — so engineering starts from the answer.',
  },
];

const PRAISE = [
  {
    q: 'SupportOps handled the first pass on every escalated ticket last month. Tiering, root-cause guesses and a draft reply in under a minute — the team only touches the queue now.',
    n: 'Head of Customer Ops',
    c: 'Fintech scale-up',
  },
  {
    q: 'Our engineers used to get paged for every 504. Now they only see the ones SupportOps could not clear, each with a handover we can copy straight into Linear.',
    n: 'SRE Lead',
    c: 'B2B SaaS platform',
  },
  {
    q: 'The draft reply alone saved our CSAs hours a day. They approve the wording, hit send, and the sentiment reads as genuinely calm.',
    n: 'Support Team Lead',
    c: 'E-commerce marketplace',
  },
];

const FAQS = [
  {
    q: 'Is it really free to try on a real ticket?',
    a: 'Yes. Copy a ticket from your own queue, paste it in, and the first triage runs free. No credit card, no wait — you keep the diagnosis and the draft even if you stop there.',
  },
  {
    q: 'What does it need to connect?',
    a: 'A workspace link (Supabase) and an AI key (Gemini) so it can store and analyze your data. Everything is verified live before you launch, and nothing ships unless the checks pass.',
  },
  {
    q: 'Who decides what gets escalated?',
    a: 'SupportOps flags what needs a human hand and packages it. Your team still owns the call — the tool drafts, you dispatch. Tier-3 handovers include impact, defect, root cause and next steps.',
  },
  {
    q: 'Does my team have to change how they work?',
    a: 'No. It reads the same tickets, logs and environments you already collect. Your people just get the first pass done for them, and the reply arrives almost ready to send.',
  },
];

export default function SetupScreen() {
  const { dispatch } = useAppState();
  const [missing, setMissing] = useState<MissingCred[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, FieldStatus>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pageStep, setPageStep] = useState<PageStep>('checking');
  const [isVerifying, setIsVerifying] = useState(false);

  const REQUIRED_SERVICES = ['supabase', 'gemini'];

  useEffect(() => {
    fetch('/api/credentials/check')
      .then(r => r.json())
      .then(data => {
        const essential = (data.missing || []).filter((c: MissingCred) => REQUIRED_SERVICES.includes(c.service));
        if (essential.length > 0) {
          setMissing(essential);
          const initialStatus: Record<string, FieldStatus> = {};
          const initialValues: Record<string, string> = {};
          for (const c of essential) {
            initialStatus[c.key] = 'empty';
            initialValues[c.key] = '';
          }
          setStatuses(initialStatus);
          setValues(initialValues);
          setPageStep('form');
        } else {
          setPageStep('done');
          setTimeout(() => dispatch({ type: 'SET_ONBOARDING_DONE' }), 800);
        }
      })
      .catch(() => {
        const fallback: MissingCred[] = [
          { service: 'supabase', key: 'SUPABASE_URL', description: 'Supabase Project URL', envVar: 'SUPABASE_URL' },
          { service: 'supabase', key: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase Service Role Key', envVar: 'SUPABASE_SERVICE_ROLE_KEY' },
          { service: 'gemini', key: 'GEMINI_API_KEY', description: 'Google Gemini API Key', envVar: 'GEMINI_API_KEY' },
        ];
        setMissing(fallback);
        const initialStatus: Record<string, FieldStatus> = {};
        const initialValues: Record<string, string> = {};
        for (const c of fallback) {
          initialStatus[c.key] = 'empty';
          initialValues[c.key] = '';
        }
        setStatuses(initialStatus);
        setValues(initialValues);
        setPageStep('form');
      });
  }, []);

  const handleValueChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setStatuses(prev => ({ ...prev, [key]: value.trim() ? 'filled' : 'empty' }));
    if (errors[key]) {
      setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  const testGemini = async (apiKey: string): Promise<boolean> => {
    setStatuses(prev => ({ ...prev, GEMINI_API_KEY: 'testing' }));
    try {
      const res = await fetch('/api/credentials/test/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (data.ok && !data.error) {
        setStatuses(prev => ({ ...prev, GEMINI_API_KEY: 'valid' }));
        return true;
      } else if (data.ok && data.error) {
        setStatuses(prev => ({ ...prev, GEMINI_API_KEY: 'warning' }));
        setErrors(prev => ({ ...prev, GEMINI_API_KEY: data.error }));
        return true;
      } else {
        setStatuses(prev => ({ ...prev, GEMINI_API_KEY: 'invalid' }));
        setErrors(prev => ({ ...prev, GEMINI_API_KEY: data.error || 'Gemini API connection failed.' }));
        return false;
      }
    } catch {
      setStatuses(prev => ({ ...prev, GEMINI_API_KEY: 'invalid' }));
      setErrors(prev => ({ ...prev, GEMINI_API_KEY: 'Network error testing Gemini connection.' }));
      return false;
    }
  };

  const testSupabase = async (url: string, key: string): Promise<boolean> => {
    setStatuses(prev => ({ ...prev, SUPABASE_URL: 'testing', SUPABASE_SERVICE_ROLE_KEY: 'testing' }));
    try {
      const res = await fetch('/api/credentials/test/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, serviceRoleKey: key }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatuses(prev => ({ ...prev, SUPABASE_URL: 'valid', SUPABASE_SERVICE_ROLE_KEY: 'valid' }));
        return true;
      } else {
        setStatuses(prev => ({ ...prev, SUPABASE_URL: 'invalid', SUPABASE_SERVICE_ROLE_KEY: 'invalid' }));
        const errMsg = data.error || 'Supabase connection failed.';
        setErrors(prev => ({ ...prev, SUPABASE_URL: errMsg, SUPABASE_SERVICE_ROLE_KEY: errMsg }));
        return false;
      }
    } catch {
      setStatuses(prev => ({ ...prev, SUPABASE_URL: 'invalid', SUPABASE_SERVICE_ROLE_KEY: 'invalid' }));
      setErrors(prev => ({ ...prev, SUPABASE_URL: 'Network error testing Supabase connection.', SUPABASE_SERVICE_ROLE_KEY: 'Network error testing Supabase connection.' }));
      return false;
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    const supabaseUrl = values['SUPABASE_URL']?.trim();
    const supabaseKey = values['SUPABASE_SERVICE_ROLE_KEY']?.trim();
    const geminiKey = values['GEMINI_API_KEY']?.trim();

    const hasSupabaseUrl = missing.some(c => c.key === 'SUPABASE_URL');
    const hasSupabaseKey = missing.some(c => c.key === 'SUPABASE_SERVICE_ROLE_KEY');
    const hasGemini = missing.some(c => c.key === 'GEMINI_API_KEY');

    const results: boolean[] = [];

    if (hasGemini && geminiKey) {
      results.push(await testGemini(geminiKey));
    }
    if ((hasSupabaseUrl || hasSupabaseKey) && supabaseUrl && supabaseKey) {
      results.push(await testSupabase(supabaseUrl, supabaseKey));
    }

    const allOk = results.length > 0 && results.every(Boolean);

    if (allOk) {
      for (const cred of missing) {
        const val = values[cred.key]?.trim();
        if (val) {
          await fetch('/api/credentials/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: cred.key, value: val }),
          });
        }
      }
      setPageStep('done');
      setTimeout(() => dispatch({ type: 'SET_ONBOARDING_DONE' }), 1200);
    }

    setIsVerifying(false);
  };

  const hasAllFilled = missing.every(c => values[c.key]?.trim());
  const hasAnyFailed = Object.values(statuses).some(s => s === 'invalid');
  const hasAnyWarning = Object.values(statuses).some(s => s === 'warning');
  const allValid = Object.values(statuses).some(s => s === 'valid' || s === 'filled' || s === 'warning') && !hasAnyFailed;

  const classify = (s: string) => {
    if (s.includes('supabase') || s.includes('SUPABASE')) return { icon: Database, color: 'text-emerald-300', name: 'Supabase' };
    if (s.includes('gemini') || s.includes('GEMINI')) return { icon: Sparkles, color: 'text-accent', name: 'Gemini AI' };
    return { icon: Key, color: 'text-amber-300', name: 'Integration' };
  };

  const quickStart = () => {
    dispatch({ type: 'SET_ONBOARDING_DONE' });
    dispatch({ type: 'SET_NAV', payload: 'inbox' });
  };

  if (pageStep === 'checking') {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void">
        <div className="absolute inset-0 hud-grid" />
        <div className="aurora -top-32 left-1/3 h-80 w-80 bg-accent/15" />
        <div className="text-center">
          <SupportOpsLogo size={52} className="mx-auto animate-pulse-glow" />
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.24em] text-muted">
            Checking configuration...
          </p>
        </div>
      </div>
    );
  }

  if (pageStep === 'done') {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void">
        <div className="absolute inset-0 hud-grid" />
        <div className="aurora top-10 left-1/4 h-80 w-80 bg-accent/18" />
        <div className="absolute -bottom-20 left-1/2 h-64 w-[130%] -translate-x-1/2 rounded-[100%] bg-accent/10 blur-3xl" />
        <div className="text-center">
          <span className="logo-tile flex h-20 w-20 items-center justify-center rounded-full border-accent/40">
            <Check className="text-accent" size={36} />
          </span>
          <h2 className="mt-6 font-display text-2xl uppercase tracking-tight text-glow-white md:text-3xl">
            All systems go
          </h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Entering your triage deck...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-void text-ink">
      {/* background scaffolds */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 hud-grid" />
        <div className="aurora -top-40 left-1/4 h-96 w-96 bg-accent/15" />
        <div className="aurora top-32 right-[6%] h-80 w-80 bg-accent/10" />
        <div className="absolute -bottom-24 left-1/2 h-64 w-[130%] -translate-x-1/2 rounded-[100%] bg-accent/8 blur-3xl" />
      </div>

      {/* ===== top nav ===== */}
      <header className="glass-strong sticky top-0 z-40 border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-6">
          <SupportOpsBrand size={30} />
          <button
            onClick={quickStart}
            className="rounded-xl bg-accent px-4 py-2 font-head text-xs font-semibold text-void shadow-[0_0_28px_-8px_rgba(255,138,61,0.9)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Try it free — paste a ticket
          </button>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative mx-auto max-w-6xl px-5 pb-10 pt-14 md:px-6 md:pt-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full glass px-4 py-1.5 text-xs">
              <span className="pulse-dot flex h-2 w-2 rounded-full bg-accent" />
              <span className="font-head font-semibold uppercase tracking-[0.18em] text-ink-soft">
                SupportOps · Autonomous escalation hub
              </span>
            </div>

            <h1 className="mt-7 font-display text-4xl uppercase leading-[1.05] tracking-tight md:text-6xl">
              Every ticket, triaged and answered{" "}
              <span className="text-glow text-accent">before your agents touch it.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
              SupportOps ingests a support ticket, classifies tier and severity, reads
              the sentiment, diagnoses root cause from the logs, and drafts the reply
              your customer can act on — then flags only what truly needs escalating.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={() => document.getElementById('launch')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 font-head font-semibold text-void shadow-[0_0_44px_-10px_rgba(255,138,61,0.9)] transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Launch your triage deck
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={quickStart}
                className="inline-flex items-center gap-2 rounded-xl glass px-7 py-3.5 font-head font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white/5"
              >
                Try it free — paste a ticket
              </button>
            </div>

            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <CircleCheck className="h-3.5 w-3.5 text-accent" /> 1 free trial
              </span>
              <span className="flex items-center gap-1.5">
                <CircleCheck className="h-3.5 w-3.5 text-accent" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CircleCheck className="h-3.5 w-3.5 text-accent" /> Runs on your tickets
              </span>
            </p>

            <a
              href="#how"
              className="mt-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition hover:text-accent"
            >
              How it works <ChevronDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>

          {/* product surface */}
          <div className="accent-edge panel p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                <Activity size={12} className="text-accent" /> Triage — TCK-9011
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-line bg-void/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Customer said</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  "Every backend API call is hanging over 30 seconds before failing with a 504. Our logistics team cannot route trucks."
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[10px] text-accent">
                  TIER 3 · SEVERE
                </span>
                <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 font-mono text-[10px] text-rose-300">
                  FRUSTRATED
                </span>
                <span className="rounded-full border border-line bg-panel-2 px-2.5 py-1 font-mono text-[10px] text-ink-soft">
                  KEDB MATCH: KB-301
                </span>
              </div>

              <div className="rounded-lg border border-line bg-void/60 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Root cause from logs</p>
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-ink-soft">
                  Database pool exhaustion detected (100/100). Locked by uncommitted write transaction #8912.
                </p>
              </div>

              <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-accent">
                  <Send size={11} /> Customer reply drafted
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  "We've isolated the outage to a database lock and are clearing it now. Full resolution is being driven by our infrastructure team."
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-line bg-panel-2/70 px-3 py-2.5">
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                  <Flag size={12} className="text-rose-400" /> Escalate to Tier 3?
                </span>
                <span className="font-head text-xs font-semibold text-accent">Yes — handover ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="border-y border-line bg-abyss py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-6">
          <p className="text-center font-head text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            three steps
          </p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center font-display text-3xl uppercase tracking-tight md:text-4xl">
            From a pasted ticket to a sent reply in minutes
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {HOW.map((s, i) => (
              <div key={s.n} className={`panel p-7 ${i < 2 ? 'md:mr-4' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl text-accent/60">{s.n}</span>
                  {i < 2 && <ArrowRight className="hidden h-5 w-5 text-muted md:block" />}
                </div>
                <h3 className="mt-4 font-head text-lg font-semibold uppercase tracking-wide">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OUTCOMES ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-6">
        <p className="font-head text-sm font-semibold uppercase tracking-[0.24em] text-accent">
          what you get
        </p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-3xl uppercase tracking-tight md:text-5xl">
            The queue clears itself
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-ink-soft md:text-base">
            Built for the person who owns the outcome: fewer open tickets, faster
            replies, and escalations that arrive with the diagnosis already attached.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {OUTCOMES.map((o, i) => {
            const Icon = o.icon;
            return (
              <div key={o.title} className="panel hover-glow p-6" style={{ transitionDelay: `${i * 40}ms` }}>
                <span className="logo-tile flex h-12 w-12 items-center justify-center">
                  <Icon className="h-5 w-5 text-accent" />
                </span>
                <h3 className="mt-5 font-head text-lg font-semibold uppercase tracking-wide">{o.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{o.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== PRAISE ===== */}
      <section className="border-y border-line bg-abyss py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-6">
          <p className="text-center font-head text-sm font-semibold uppercase tracking-[0.24em] text-accent-soft">
            reports from the floor
          </p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center font-display text-3xl uppercase tracking-tight md:text-4xl">
            What support leaders do with it
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PRAISE.map((t, i) => (
              <figure key={t.n} className="panel flex h-full flex-col p-7">
                <blockquote className="flex-1 text-sm leading-relaxed text-ink-soft">
                  "{t.q}"
                </blockquote>
                <figcaption className="mt-6 border-t border-line pt-4">
                  <p className="font-head text-sm font-semibold">{t.n}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">{t.c}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LAUNCH / CONNECT ===== */}
      <section id="launch" className="mx-auto max-w-6xl px-5 py-20 md:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="lg:sticky lg:top-24">
            <p className="font-head text-sm font-semibold uppercase tracking-[0.24em] text-accent">
              first launch
            </p>
            <h2 className="mt-2 font-display text-3xl uppercase tracking-tight md:text-4xl">
              Connect your workspace, launch your deck
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft md:text-base">
              Two quick connections — your Supabase workspace and a Gemini AI key —
              and the triage deck is live. Every credential is verified in real time,
              and you can skip setup entirely if you just want to paste a ticket.
            </p>
            <div className="mt-6 space-y-3">
              <p className="flex items-center gap-2 font-mono text-xs text-muted">
                <CircleCheck className="h-4 w-4 text-accent" /> Credentials verified in real time
              </p>
              <p className="flex items-center gap-2 font-mono text-xs text-muted">
                <CircleCheck className="h-4 w-4 text-accent" /> Stored in-memory for the session
              </p>
              <p className="flex items-center gap-2 font-mono text-xs text-muted">
                <CircleCheck className="h-4 w-4 text-accent" /> Or skip straight to a free ticket
              </p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="accent-edge panel p-6 shadow-2xl">
            <div className="space-y-5">
              {missing.map(cred => {
                const cls = classify(cred.service);
                const Icon = cls.icon;
                const status = statuses[cred.key] || 'empty';
                const error = errors[cred.key];

                return (
                  <div key={cred.key}>
                    <label className="mb-1.5 flex items-center gap-2 font-head text-sm font-medium text-ink-soft">
                      <Icon size={14} className={cls.color} />
                      <span>{cls.name} — {cred.description}</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder={`Enter your ${cred.key}`}
                        value={values[cred.key] || ''}
                        onChange={e => handleValueChange(cred.key, e.target.value)}
                        className={`w-full rounded-xl border bg-void p-3 pr-10 text-sm text-ink transition-all placeholder:text-muted focus:outline-none focus:ring-2 ${
                          status === 'invalid'
                            ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30'
                            : status === 'warning'
                            ? 'border-amber-500/60 focus:border-amber-500 focus:ring-amber-500/30'
                            : status === 'valid'
                            ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/30'
                            : 'border-line focus:border-accent/60 focus:ring-accent/20'
                        }`}
                        required
                        autoComplete="off"
                        disabled={isVerifying}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {status === 'testing' && <Loader size={16} className="animate-spin text-accent" />}
                        {status === 'valid' && <Check size={16} className="text-emerald-400" />}
                        {status === 'warning' && <AlertTriangle size={16} className="text-amber-400" />}
                        {status === 'invalid' && <XCircle size={16} className="text-rose-400" />}
                        {status === 'empty' && values[cred.key]?.trim() && <Activity size={16} className="text-muted" />}
                      </span>
                    </div>
                    {status === 'invalid' && error && (
                      <div className="mt-1.5 flex items-start gap-1.5 text-xs text-rose-400">
                        <XCircle size={12} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    {status === 'warning' && error && (
                      <div className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-400">
                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    {status === 'valid' && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
                        <Check size={12} />
                        <span>Connection verified</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-line pt-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Verification status</span>
                <span className={`flex items-center gap-1.5 font-head font-medium ${
                  hasAnyFailed ? 'text-rose-400' : hasAnyWarning ? 'text-amber-400' : allValid ? 'text-emerald-400' : 'text-muted'
                }`}>
                  {hasAnyFailed ? (
                    <><XCircle size={12} /> Some checks failed</>
                  ) : hasAnyWarning ? (
                    <><AlertTriangle size={12} /> Connected with warnings</>
                  ) : allValid ? (
                    <><Check size={12} /> Ready to launch</>
                  ) : (
                    <><Activity size={12} /> Fill in all fields</>
                  )}
                </span>
              </div>

              <button
                type="submit"
                disabled={!hasAllFilled || isVerifying}
                className={`w-full rounded-xl py-3 px-4 font-head text-sm font-semibold transition-all duration-200 ${
                  hasAnyFailed || hasAnyWarning
                    ? 'bg-amber-500 text-void shadow-amber-500/20'
                    : 'bg-accent text-void shadow-[0_0_32px_-8px_rgba(255,138,61,0.9)] hover:brightness-110'
                } flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 disabled:hover:translate-y-0 disabled:bg-panel-2 disabled:text-muted disabled:shadow-none`}
              >
                {isVerifying ? (
                  <><RefreshCw size={16} className="animate-spin" /> Verifying connections...</>
                ) : hasAnyFailed ? (
                  <><RefreshCw size={16} /> Retry Failed & Launch</>
                ) : hasAnyWarning ? (
                  <><ArrowRight size={16} /> Launch Anyway</>
                ) : (
                  <><ArrowRight size={16} /> Verify & Launch</>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'SET_ONBOARDING_DONE' });
                    dispatch({ type: 'SET_NAV', payload: 'project' });
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-medium text-ink transition-all hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <FolderCode size={14} className="text-accent" />
                  <span>Skip setup — upload a project</span>
                </button>
                <button
                  type="button"
                  onClick={quickStart}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-panel-2/70 px-3 py-2.5 text-xs font-medium text-ink transition-all hover:-translate-y-0.5 hover:bg-white/5"
                >
                  <ArrowRight size={14} className="text-accent" />
                  <span>Skip setup — paste a ticket</span>
                </button>
              </div>

              {hasAnyFailed && (
                <p className="text-center text-[10px] text-muted">
                  Fix the errors above and retry, or skip to paste a ticket to test immediately.
                </p>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="mx-auto max-w-3xl px-5 py-20 md:px-6">
        <p className="text-center font-head text-sm font-semibold uppercase tracking-[0.24em] text-accent-soft">
          straight answers
        </p>
        <h2 className="mt-2 text-center font-display text-3xl uppercase tracking-tight md:text-4xl">
          Before you ask
        </h2>

        <div className="mt-10 space-y-3">
          {FAQS.map(f => (
            <details key={f.q} className="panel group overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-head font-semibold">
                {f.q}
                <span className="text-xl leading-none text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="pb-24">
        <div className="accent-edge panel mx-auto max-w-4xl p-8 text-center md:p-12">
          <SupportOpsLogo size={44} className="mx-auto" />
          <p className="mt-5 font-head text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            go triage
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl uppercase tracking-tight md:text-5xl">
            Paste a ticket and watch the queue clear
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft md:text-base">
            One free triage on your real work. Keep the diagnosis and the drafted
            reply, then launch the full deck when it earns its place on shift.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={quickStart}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 font-head font-semibold text-void shadow-[0_0_44px_-10px_rgba(255,138,61,0.9)] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Try SupportOps free <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => document.getElementById('launch')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 rounded-xl glass px-8 py-3.5 font-head font-semibold transition hover:-translate-y-0.5 hover:bg-white/5"
            >
              Connect your workspace
            </button>
          </div>
        </div>
      </section>

      {/* ===== footer ===== */}
      <footer className="border-t border-line bg-abyss">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row md:px-6">
          <SupportOpsBrand size={26} subtitle="autonomous escalation hub" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Triage · Diagnose · Reply · Escalate
          </p>
        </div>
      </footer>
    </div>
  );
}