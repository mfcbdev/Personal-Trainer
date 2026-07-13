import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught', error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-full flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-red-500/15 flex items-center justify-center mb-4">
            <AlertCircle size={26} className="text-red-400" />
          </div>
          <h1 className="font-display text-xl font-semibold text-zinc-50 mb-1">Algo salió mal</h1>
          <p className="text-sm text-zinc-400 mb-6">
            Ocurrió un error inesperado. Intenta de nuevo, y si persiste recarga la página.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={this.reset}
              className="flex-1 h-11 rounded-lg bg-accent text-zinc-950 text-sm font-medium flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Reintentar
            </button>
            <button
              type="button"
              onClick={this.reload}
              className="h-11 px-4 rounded-lg bg-surface text-zinc-200 text-sm font-medium"
            >
              Recargar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
