import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-[rgba(0,0,0,0.8)] border-4 border-accent-red m-4 text-text-parchment font-pixel text-xl">
          <h2 className="text-3xl text-accent-red mb-2">Erro Crítico no Sistema</h2>
          <p className="mb-4">As trevas corromperam este módulo.</p>
          <pre className="bg-black p-2 text-sm overflow-auto text-accent-red border border-accent-red">
            {this.state.error?.message}
          </pre>
          <button
            className="mt-4 bg-panel-bg border-2 border-border-gold text-border-gold px-4 py-2 hover:bg-[rgba(139,107,50,0.3)]"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Tentar Restaurar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
