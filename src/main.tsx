import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{children: ReactNode}> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-void flex items-center justify-center p-4">
          <div className="max-w-md text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="h-14 w-14 text-rose-400" aria-hidden="true">
                <path d="M24 8L42 40H6L24 8Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
                <path d="M24 20v9M24 33.5v.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="font-display text-xl font-bold text-ink uppercase tracking-tight">Something went wrong</h1>
            <pre className="max-h-60 overflow-auto rounded-xl border border-line bg-abyss p-4 text-left text-xs text-ink-soft">{(this.state.error as Error).stack}</pre>
            <button onClick={() => location.reload()} className="rounded-xl bg-accent hover:brightness-110 text-void px-6 py-2 font-head font-semibold text-sm transition-all">
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);