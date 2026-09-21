import React, { useState } from 'react';
import { useAppState } from '../../store/index';
import { BookOpen, Sparkles, Plus, X, Search } from 'lucide-react';

export default function KEDBLibrary() {
  const { state, dispatch } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newArticle, setNewArticle] = useState({ id: '', title: '', category: 'General' as const, content: '', steps: '' });

  const filtered = state.kbArticles.filter(a =>
    a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/kb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newArticle.id,
          title: newArticle.title,
          category: newArticle.category,
          content: newArticle.content,
          steps: newArticle.steps.split('\n').filter(s => s.trim()),
        }),
      });
      if (res.ok) {
        const created = await res.json();
        dispatch({ type: 'SET_KB_ARTICLES', payload: [...state.kbArticles, created] });
        setIsAdding(false);
        setNewArticle({ id: '', title: '', category: 'General', content: '', steps: '' });
      }
    } catch { /* ignore */ }
  };

  const input =
    'w-full rounded-md border border-line bg-void p-2 text-xs text-ink focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-head text-xs font-semibold text-accent">
            known error database
          </p>
          <h2 className="mt-1 font-display text-2xl  leading-tight">KEDB library</h2>
          <p className="mt-1 text-xs text-ink-soft">{state.kbArticles.length} known-error articles powering the triage</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-void shadow-[0_0_18px_-6px_rgba(255,138,61,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
        >
          <Plus size={14} />Add Article
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-muted" size={14} />
        <input
          type="text"
          placeholder="Search KEDB..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={input + ' pl-9'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map(article => (
          <div key={article.id} className="panel p-5 transition-all duration-200 hover:-translate-y-0.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-accent-soft">{article.id}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${
                article.category === 'Known Error' ? 'bg-rose-400/10 text-rose-300 border-rose-400/30' :
                article.category === 'Technical' ? 'bg-amber-300/10 text-amber-200 border-amber-300/30' :
                'bg-panel-2 text-ink-soft border-line'
              }`}>{article.category}</span>
            </div>
            <h3 className="mb-2 font-head text-sm font-semibold text-ink">{article.title}</h3>
            <p className="mb-3 text-xs leading-relaxed text-ink-soft">{article.content}</p>
            {article.steps && article.steps.length > 0 && (
              <div>
                <span className="flex items-center gap-1 font-mono text-[10px] font-bold  tracking-wider text-muted">
                  <Sparkles size={11} className="text-accent" />Resolution Steps:
                </span>
                <ol className="mt-1 list-decimal space-y-1 pl-4 text-[11px] text-ink-soft">
                  {article.steps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="panel col-span-full p-10 text-center text-muted">
            <BookOpen size={28} className="mx-auto mb-3 opacity-60" />
            <p className="text-xs">No matching articles</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/70 p-4 backdrop-blur-sm">
          <div className="accent-edge panel w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-line bg-abyss p-4">
              <h3 className="flex items-center gap-2 font-head text-sm font-semibold text-ink"><BookOpen size={16} className="text-accent" />New KB Article</h3>
              <button onClick={() => setIsAdding(false)} className="text-muted transition-colors hover:text-ink"><X size={16} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 p-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-head font-semibold text-ink-soft">Article ID</label>
                  <input type="text" placeholder="KB-XXX" value={newArticle.id} onChange={e => setNewArticle({ ...newArticle, id: e.target.value })} className={input} required />
                </div>
                <div className="space-y-1">
                  <label className="font-head font-semibold text-ink-soft">Category</label>
                  <select value={newArticle.category} onChange={e => setNewArticle({ ...newArticle, category: e.target.value as any })} className={input}>
                    <option value="General">General</option>
                    <option value="Technical">Technical</option>
                    <option value="Known Error">Known Error</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-head font-semibold text-ink-soft">Title</label>
                <input type="text" value={newArticle.title} onChange={e => setNewArticle({ ...newArticle, title: e.target.value })} className={input} required />
              </div>
              <div className="space-y-1">
                <label className="font-head font-semibold text-ink-soft">Content</label>
                <textarea rows={4} value={newArticle.content} onChange={e => setNewArticle({ ...newArticle, content: e.target.value })} className={input} required />
              </div>
              <div className="space-y-1">
                <label className="font-head font-semibold text-ink-soft">Steps (one per line)</label>
                <textarea rows={3} value={newArticle.steps} onChange={e => setNewArticle({ ...newArticle, steps: e.target.value })} className={input} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="rounded border border-line px-4 py-2 text-ink-soft transition-colors hover:bg-white/5">Cancel</button>
                <button type="submit" className="rounded bg-accent px-4 py-2 font-head font-semibold text-void shadow-[0_0_18px_-6px_rgba(255,138,61,0.9)] transition-all hover:brightness-110">Create Article</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}