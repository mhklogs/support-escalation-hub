import { useState, useEffect } from 'react';
import { useAppState } from '../../store/index';
import { useTickets } from '../../hooks/useTickets';
import HandoverSummary from './HandoverSummary';
import { Ticket } from '../../types/index';
import { Bot, CheckCircle, BookOpen, Copy, Send, Check, Edit2, Cpu } from 'lucide-react';
import SupportOpsLogo from '../Brand/Logo';

interface Props {
  ticket: Ticket;
}

export default function AgentOutput({ ticket }: Props) {
  const { state, dispatch } = useAppState();
  const { handleRunAgent, showToast } = useTickets();
  const [editableResponse, setEditableResponse] = useState(ticket.agentResponse || '');
  const [isEditingMode, setIsEditingMode] = useState(false);

  useEffect(() => {
    setEditableResponse(ticket.agentResponse || '');
    setIsEditingMode(false);
  }, [ticket.id]);

  const getKBArticleMatch = () => {
    const desc = (ticket.subject + ' ' + ticket.description).toLowerCase();
    if (desc.includes('double charge') || desc.includes('subscription') || desc.includes('billing') || desc.includes('refund'))
      return state.kbArticles.find(a => a.id === 'KB-101') || null;
    if (desc.includes('signature') || desc.includes('webhook') || desc.includes('401'))
      return state.kbArticles.find(a => a.id === 'KB-202') || null;
    if (desc.includes('rotate') || desc.includes('rotation') || desc.includes('credentials'))
      return state.kbArticles.find(a => a.id === 'KB-205') || null;
    if (desc.includes('pool') || desc.includes('exhaustion') || desc.includes('504') || desc.includes('postgresql'))
      return state.kbArticles.find(a => a.id === 'KB-301') || null;
    return null;
  };

  const matchedKB = getKBArticleMatch();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard.`);
  };

  const handleSaveResponse = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentResponse: editableResponse, status: 'Resolved' }),
      });
      if (res.ok) {
        const updated = await res.json();
        dispatch({ type: 'UPDATE_TICKET', payload: { ...ticket, ...updated } });
        setIsEditingMode(false);
        showToast('Response saved. Ticket resolved.');
      }
    } catch {
      showToast('Error saving response.');
    }
  };

  if (!ticket.assignedTier) {
    return (
      <div className="panel overflow-hidden">
        <div className="border-b border-line bg-abyss py-3.5 px-5">
          <h3 className="flex items-center gap-2 text-xs font-bold  tracking-wider text-ink-soft">
            <Bot size={15} className="text-accent" />Agent Output
          </h3>
        </div>
        <div className="mx-auto max-w-sm space-y-4 p-8 text-center">
          <SupportOpsLogo size={40} className="mx-auto opacity-60" ring={false} />
          <div className="space-y-1">
            <h4 className="font-head text-xs font-semibold text-ink">No diagnosis yet</h4>
            <p className="text-[11px] text-muted">Run the AI triage agent to analyze this ticket.</p>
          </div>
          <button
            onClick={handleRunAgent}
            disabled={state.isAnalyzing}
            className="w-full rounded-md bg-accent px-4 py-2 text-xs font-medium text-void shadow-[0_0_18px_-6px_rgba(255,138,61,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 disabled:bg-panel-2 disabled:text-muted disabled:shadow-none"
          >
            {state.isAnalyzing ? 'Processing...' : 'Analyze now'}
          </button>
        </div>
      </div>
    );
  }

  const getSentimentColor = (s: string) => {
    switch (s) {
      case 'Frustrated': return 'bg-rose-400/10 text-rose-300 border-rose-400/30';
      case 'Anxious': return 'bg-amber-300/10 text-amber-200 border-amber-300/30';
      case 'Neutral': return 'bg-panel-2 text-ink-soft border-line';
      case 'Calm': return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30';
      default: return 'bg-panel-2 text-ink-soft border-line';
    }
  };

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-abyss py-3.5 px-5">
        <h3 className="flex items-center gap-2 text-xs font-bold  tracking-wider text-ink-soft">
          <Bot size={15} className="text-accent" />Agent Diagnostic Output
        </h3>
        <span className="flex items-center gap-1 rounded border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 font-mono text-xs text-emerald-300 font-medium">
          <CheckCircle size={11} />Autopilot Complete
        </span>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 border-b border-line pb-5 md:grid-cols-3">
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold  tracking-wider text-muted">Tier Assignment</span>
            <div className="flex items-center gap-2 font-head text-xs font-bold text-ink">
              <span className={`h-2.5 w-2.5 rounded-full ${ticket.assignedTier === 3 ? 'bg-rose-400' : ticket.assignedTier === 2 ? 'bg-amber-300' : 'bg-emerald-400'}`} />
              Tier {ticket.assignedTier} &mdash; {ticket.assignedTier === 3 ? 'Infrastructure' : ticket.assignedTier === 2 ? 'Technical' : 'General'}
            </div>
          </div>
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold  tracking-wider text-muted">Sentiment</span>
            <span className={`inline-block rounded border px-2 py-0.5 text-[10px] ${getSentimentColor(ticket.sentiment)}`}>{ticket.sentiment}</span>
          </div>
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold  tracking-wider text-muted">KEDB Match</span>
            {matchedKB ? (
              <span className="flex max-w-full items-center gap-1 truncate rounded border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">
                <BookOpen size={10} />{matchedKB.id}: {matchedKB.title}
              </span>
            ) : (
              <span className="text-[10px] italic text-muted">No strong match</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-void/60 p-4 text-xs leading-relaxed text-ink-soft">
          <strong className="mb-1 block font-head text-ink">Agent Reasoning:</strong>
          {ticket.agentNotes}
        </div>

        {ticket.assignedTier === 3 && ticket.handoverSummary && (
          <HandoverSummarySummary
            ticket={ticket}
            isEditingMode={isEditingMode}
            setIsEditingMode={setIsEditingMode}
            onCopy={handleCopy}
          />
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1 font-head text-xs font-bold  tracking-wider text-ink-soft">
              <Send size={12} className="text-accent" />Customer Response Draft
            </label>
            <button
              onClick={() => handleCopy(editableResponse, 'Response')}
              className="flex items-center gap-1.5 text-[10px] text-muted hover:text-ink"
            >
              <Copy size={11} /> Copy
            </button>
          </div>
          <textarea
            rows={6}
            value={editableResponse}
            onChange={e => setEditableResponse(e.target.value)}
            className="w-full whitespace-pre-wrap rounded-lg border border-line bg-void p-3.5 text-xs leading-relaxed text-ink-soft transition-all focus:border-accent/50 focus:bg-void focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
          {ticket.assignedTier !== 3 && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveResponse}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-void shadow-[0_0_18px_-6px_rgba(255,138,61,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
              >
                <Check size={14} />Send & Resolve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HandoverSummarySummary({ ticket, isEditingMode, setIsEditingMode, onCopy }: any) {
  const { dispatch } = useAppState();
  const { showToast } = useTickets();
  const [editable, setEditable] = useState(ticket.handoverSummary);

  useEffect(() => {
    setEditable(ticket.handoverSummary);
  }, [ticket.handoverSummary]);

  const handleSaveHandover = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handoverSummary: editable, status: 'Escalated' }),
      });
      if (res.ok) {
        showToast('Escalation dispatched to engineering!');
        setIsEditingMode(false);
      }
    } catch {
      showToast('Error dispatching handover.');
    }
  };

  if (!editable) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-rose-400/30 bg-rose-400/5">
      <div className="flex items-center justify-between bg-rose-950/70 px-5 py-3">
        <h4 className="flex items-center gap-2 text-xs font-bold  tracking-wider text-rose-200">
          <span className="font-mono text-rose-300">[ESC-{ticket.id}]</span>INTERNAL HANDOVER (Tier 3)
        </h4>
        <button
          onClick={() => {
            const text = `[ESC-${ticket.id}] HANDOVER\nImpact: ${editable.customerImpact}\nDefect: ${editable.defectSummary}\nRoot Cause: ${editable.rootCauseHypothesis}\nEnvironment: ${editable.environmentSpecs}\nNext Steps: ${editable.nextSteps}`;
            onCopy(text, 'Handover');
          }}
          className="flex items-center gap-1 rounded-md bg-rose-950/80 px-2 py-1 text-[10px] text-rose-200 transition-all hover:bg-rose-950 hover:text-ink"
        >
          <Copy size={11} /> Copy
        </button>
      </div>
      <div className="space-y-4 p-5">
        {!isEditingMode ? (
          <div className="grid grid-cols-1 gap-4 text-xs text-ink-soft md:grid-cols-2">
            <div><span className="font-head font-semibold text-ink block">Impact:</span><div className="mt-1 rounded border border-line bg-void p-2">{editable.customerImpact}</div></div>
            <div><span className="font-head font-semibold text-ink block">Defect:</span><div className="mt-1 rounded border border-line bg-void p-2">{editable.defectSummary}</div></div>
            <div className="md:col-span-2"><span className="font-head font-semibold text-ink block">Root Cause:</span><div className="mt-1 rounded border border-line bg-void p-2">{editable.rootCauseHypothesis}</div></div>
            <div><span className="font-head font-semibold text-ink block">Environment:</span><div className="mt-1 rounded border border-line bg-void p-2 font-mono text-[11px] text-accent-soft">{editable.environmentSpecs}</div></div>
            <div><span className="font-head font-semibold text-ink block">Next Steps:</span><div className="mt-1 rounded border border-line bg-void p-2">{editable.nextSteps}</div></div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {['customerImpact', 'defectSummary', 'rootCauseHypothesis', 'environmentSpecs', 'nextSteps'].map(field => (
              <div key={field}>
                <label className="font-head font-semibold text-ink block capitalize">{field.replace(/([A-Z])/g, ' $1')}:</label>
                <input
                  type="text"
                  value={(editable as any)[field] || ''}
                  onChange={e => setEditable({ ...editable, [field]: e.target.value })}
                  className="mt-1 w-full rounded border border-line bg-void p-2 text-xs text-ink-soft focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-[11px] italic text-muted">Ready for Jira / Slack / Linear sync</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingMode(!isEditingMode)}
              className="flex items-center gap-1 rounded border border-line bg-panel-2 px-3 py-1.5 text-xs text-ink-soft transition-all hover:bg-white/5"
            >
              <Edit2 size={12} />{isEditingMode ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={handleSaveHandover}
              className="flex items-center gap-1.5 rounded bg-rose-500 px-3 py-1.5 text-xs font-semibold text-ink shadow-[0_0_16px_-6px_rgba(244,63,94,0.9)] transition-all hover:brightness-110"
            >
              <Send size={12} />Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}