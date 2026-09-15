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

  const input = 'w-full text-sm p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all';

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Plus size={15} className="text-indigo-400" />New Support Ticket
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Customer Name</label>
              <input type="text" required value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className={input} placeholder="Jane Cooper" />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Company</label>
              <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className={input} placeholder="Acme Corp" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">Subject</label>
            <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={input} placeholder="API key rotation failed with 401" />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">Description</label>
            <textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={input} placeholder="Describe the issue the customer is facing..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg font-semibold shadow flex items-center gap-1.5 transition-all">
              <Send size={12} />{saving ? 'Creating...' : 'Create Ticket'}
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
    <div className="flex-1 flex overflow-hidden bg-slate-100">
      <div className="w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col">
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
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      {state.isOnboarding ? (
        <SetupScreen />
      ) : (
        <>
          <Header />
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 bg-slate-100">
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