import { useState } from 'react';
import { Settings, Key, Database, Webhook, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface IntegrationCard {
  id: string;
  name: string;
  icon: typeof Key;
  description: string;
  status: 'connected' | 'disconnected' | 'pending';
  fields: { key: string; label: string; placeholder: string }[];
}

const INTEGRATIONS: IntegrationCard[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    icon: Database,
    description: 'Persistent storage for tickets, logs, and KEDB articles.',
    status: 'disconnected',
    fields: [
      { key: 'SUPABASE_URL', label: 'Project URL', placeholder: 'https://xxxxx.supabase.co' },
      { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Service Role Key', placeholder: 'eyJhbGciOi...' },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini AI',
    icon: Key,
    description: 'Google Gemini API for autonomous ticket analysis.',
    status: 'disconnected',
    fields: [
      { key: 'GEMINI_API_KEY', label: 'API Key', placeholder: 'AIzaSy...' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: Webhook,
    description: 'Payment processing and webhook event integration.',
    status: 'disconnected',
    fields: [
      { key: 'STRIPE_SECRET_KEY', label: 'Secret Key', placeholder: 'sk_live_...' },
      { key: 'STRIPE_WEBHOOK_SECRET', label: 'Webhook Secret', placeholder: 'whsec_...' },
    ],
  },
];

export default function SettingsPanel() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const handleSave = async (integrationId: string) => {
    setSaving(integrationId);
    const integ = integrations.find(i => i.id === integrationId);
    if (!integ) return;

    try {
      for (const field of integ.fields) {
        const val = values[field.key];
        if (val) {
          await fetch('/api/credentials/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: field.key, value: val }),
          });
        }
      }
      setIntegrations(prev => prev.map(i => i.id === integrationId ? { ...i, status: 'connected' as const } : i));
      setSaved(integrationId);
      setTimeout(() => setSaved(null), 3000);
    } catch { /* ignore */ }
    setSaving(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <p className="font-head text-xs font-semibold text-accent">
          integrations
        </p>
        <h2 className="mt-1 font-display text-2xl  leading-tight">Settings &amp; connections</h2>
        <p className="mt-1 text-xs text-ink-soft">Configure the external services that power the triage deck</p>
      </div>

      <div className="space-y-4">
        {integrations.map(integ => {
          const Icon = integ.icon;
          return (
            <div key={integ.id} className="panel p-5">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2.5 ${integ.status === 'connected' ? 'bg-emerald-400/10' : 'bg-panel-2'}`}>
                    <Icon size={18} className={integ.status === 'connected' ? 'text-emerald-300' : 'text-muted'} />
                  </div>
                  <div>
                    <h3 className="font-head text-sm font-semibold text-ink">{integ.name}</h3>
                    <p className="text-xs text-ink-soft">{integ.description}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  integ.status === 'connected' ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30' : 'bg-panel-2 text-muted border-line'
                }`}>
                  {integ.status === 'connected' ? <Check size={10} /> : <AlertCircle size={10} />}
                  {integ.status === 'connected' ? 'Connected' : 'Not Configured'}
                </span>
              </div>

              <div className="space-y-3">
                {integ.fields.map(field => (
                  <div key={field.key}>
                    <label className="mb-1 block text-xs font-medium text-ink-soft">{field.label}</label>
                    <input
                      type="password"
                      placeholder={field.placeholder}
                      value={values[field.key] || ''}
                      onChange={e => setValues({ ...values, [field.key]: e.target.value })}
                      className="w-full rounded-md border border-line bg-void p-2.5 text-xs text-ink transition-all placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleSave(integ.id)}
                  disabled={saving === integ.id}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-void shadow-[0_0_18px_-6px_rgba(255,138,61,0.9)] transition-all duration-200 hover:brightness-110 disabled:bg-panel-2 disabled:text-muted disabled:shadow-none"
                >
                  {saving === integ.id ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : saved === integ.id ? (
                    <Check size={12} />
                  ) : null}
                  {saving === integ.id ? 'Saving...' : saved === integ.id ? 'Saved' : 'Save & Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}