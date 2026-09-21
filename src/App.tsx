import React, { useEffect, useState } from 'react';
import { AppProvider, useAppState } from './store/index';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Toast from './components/Layout/Toast';
import SetupScreen from './components/Onboarding/SetupScreen';
import ProjectAnalyzer from './components/Project/ProjectAnalyzer';
import Inbox from './components/Dashboard/Inbox';
import TicketList from './components/Queue/TicketList';
import TicketDetail from './components/Workspace/TicketDetail';
import KEDBLibrary from './components/KEDB/KEDBLibrary';
import IngressStream from './components/Ingress/IngressStream';
import SettingsPanel from './components/Settings/SettingsPanel';
import { useTickets } from './hooks/useTickets';
import { X, Plus, Send } from 'lucide-react';

function CreateTicketModal({ onClose }: { onClose: () => void }) {
  const { dispatch } = useAppState();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ customerName: '', company: '', subject: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created = await res.json();
        const ticketsRes = await fetch('/api/tickets');
        const ticketsData = await ticketsRes.json();
        dispatch({ type: 'SET_TICKETS', payload: ticketsData });
        dispatch({ type: 'SET_ACTIVE_TICKET', payload: created.id });
        dispatch({ type: 'SHOW_TOAST', payload: 'Ticket created and added to the queue.' });
        onClose();
      } else {
        dispatch({ type: 'SHOW_TOAST', payload: 'Failed to create ticket.' });
      }
    } catch {
      dispatch({ type: 'SHOW_TOAST', payload: 'Network error creating ticket.' });
    }
    setSaving(false);
  };

  const input =
    'w-full text-sm p-2.5 bg-void border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm">
      <div className="accent-edge panel w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-head text-sm font-semibold text-ink flex items-center gap-2">
            <Plus size={15} className="text-accent" />New Support Ticket
          </h3>
          <button onClick={onClose} className="text-muted transition-colors hover:text-white">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-head font-semibold text-ink-soft block">Customer Name</label>
              <input type="text" required value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className={input} placeholder="Jane Cooper" />
            </div>
            <div className="space-y-1">
              <label className="font-head font-semibold text-ink-soft block">Company</label>
              <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className={input} placeholder="Acme Corp" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-head font-semibold text-ink-soft block">Subject</label>
            <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={input} placeholder="API key rotation failed with 401" />
          </div>
          <div className="space-y-1">
            <label className="font-head font-semibold text-ink-soft block">Description</label>
            <textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={input} placeholder="Describe the issue the customer is facing..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-line px-4 py-2 text-ink-soft transition-colors hover:bg-white/5">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 font-head font-semibold text-void shadow-[0_0_24px_-6px_rgba(255,138,61,0.8)] transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:bg-panel-2 disabled:text-muted disabled:shadow-none disabled:hover:translate-y-0"
            >
              <Send size={12} />
              {saving ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QueueView() {
  const [showCreate, setShowCreate] = useState(false);
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-void lg:flex-row">
      <div className="flex w-full shrink-0 flex-col border-b border-line bg-abyss lg:w-80 lg:border-b-0 lg:border-r">
        <TicketList onOpenCreate={() => setShowCreate(true)} />
      </div>
      <TicketDetail />
      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function AppContent() {
  const { state, dispatch } = useAppState();
  const { fetchInitialData } = useTickets();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/credentials/check')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        const geminiMissing = (data.missing || []).some((c: any) => c.key === 'GEMINI_API_KEY');
        if (geminiMissing) {
          dispatch({ type: 'SET_ONBOARDING', payload: true });
        }
      })
      .catch(() => { /* server offline: proceed with default views */ })
      .finally(() => {
        if (mounted) fetchInitialData();
      });
    return () => { mounted = false; };
  }, []);

  const renderView = () => {
    switch (state.activeNav) {
      case 'inbox': return <Inbox />;
      case 'queue': return <QueueView />;
      case 'kedb': return <KEDBLibrary />;
      case 'ingress': return <IngressStream />;
      case 'settings': return <SettingsPanel />;
      default: return <ProjectAnalyzer />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-void font-sans text-ink selection:bg-accent/40 selection:text-white">
      {state.isOnboarding ? (
        <SetupScreen />
      ) : (
        <>
          <Header onMenu={() => setMenuOpen(v => !v)} menuOpen={menuOpen} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
            <main className="flex min-w-0 flex-1 flex-col bg-void">
              {renderView()}
            </main>
          </div>
        </>
      )}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}