import React, { useState } from 'react';
import { useAppState } from '../../store/index';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X, Shield, RefreshCw, Check } from 'lucide-react';

export default function CredentialModal() {
  const { state, dispatch } = useAppState();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      for (const key of state.missingCredentials) {
        const val = values[key];
        if (val) {
          await fetch('/api/credentials/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value: val }),
          });
        }
      }
      dispatch({ type: 'SET_CREDENTIAL_MODAL', payload: { open: false, missing: [] } });
      dispatch({ type: 'SHOW_TOAST', payload: 'Credentials saved successfully.' });
    } catch {
      dispatch({ type: 'SHOW_TOAST', payload: 'Error saving credentials.' });
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {state.isCredentialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="accent-edge panel w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-line bg-abyss p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/15 p-2">
                  <Shield size={18} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-head text-sm font-semibold text-ink">Credentials Required</h3>
                  <p className="font-mono text-[10px]  tracking-wider text-muted">Configure service integrations</p>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_CREDENTIAL_MODAL', payload: { open: false, missing: [] } })}
                className="text-muted transition-colors hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <p className="text-xs text-ink-soft">
                The following credentials are missing. They will be stored for the session and used for API integrations.
              </p>

              {state.missingCredentials.map(key => (
                <div key={key} className="space-y-1">
                  <label className="font-head text-xs font-semibold  tracking-wider text-ink-soft block">
                    <Key size={12} className="mr-1 inline text-accent" />
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="password"
                    placeholder={`Enter ${key}`}
                    value={values[key] || ''}
                    onChange={e => setValues({ ...values, [key]: e.target.value })}
                    className="w-full rounded-md border border-line bg-void p-2.5 text-xs text-ink transition-all placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    required
                  />
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_CREDENTIAL_MODAL', payload: { open: false, missing: [] } })}
                  className="text-xs text-muted transition-colors hover:text-ink"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-semibold text-void shadow-[0_0_20px_-6px_rgba(255,138,61,0.9)] transition-all hover:brightness-110 disabled:bg-panel-2 disabled:text-muted disabled:shadow-none"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? 'Saving...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}