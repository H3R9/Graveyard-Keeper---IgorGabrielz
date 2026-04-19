import React, { Component, ErrorInfo } from 'react';
import { Skull, RefreshCw } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  userId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryCore extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error bound by ErrorBoundary:', error, errorInfo);
    
    // Log the error to Firestore
    try {
      addDoc(collection(db, 'errorLogs'), {
        userId: this.props.userId || 'anonymous',
        message: error.message,
        stack: errorInfo.componentStack,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error('Failed to log error to Firestore', e);
    }
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-[rgba(18,14,12,0.8)] border border-accent-red/50 rounded-sm min-h-[300px] shadow-[inset_0_0_20px_rgba(223,68,68,0.1)] w-full max-w-3xl mx-auto my-8">
          <Skull className="text-accent-red mb-4" size={48} />
          <h3 className="text-2xl font-pixel text-accent-red mb-2 uppercase tracking-wide">
            {this.props.fallbackTitle || "O Zelador encontrou um erro..."}
          </h3>
          <p className="text-text-parchment mb-6 max-w-lg leading-relaxed">
            {this.props.fallbackMessage || "As runas de carregamento falharam ou o conhecimento foi corrompido. Os coveiros já foram notificados do ocorrido."}
          </p>
          
          <div className="bg-black/50 p-3 mb-8 rounded w-full border border-border-dark overflow-x-auto text-left">
            <p className="text-xs text-accent-red font-mono whitespace-nowrap">
              <span className="text-text-muted">FATAL: </span> {this.state.error?.message}
            </p>
          </div>
          
          <button
            onClick={this.resetError}
            className="flex items-center space-x-2 bg-bg-dark border border-accent-red text-white px-6 py-3 hover:bg-accent-red transition-all duration-300 group rounded-sm"
          >
            <RefreshCw size={18} className="group-hover:animate-spin" />
            <span className="font-pixel uppercase text-sm tracking-widest">Tentar Novamente</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Function wrapper to inject context hooks into the Class Component
export function ErrorBoundary({ children, fallbackTitle, fallbackMessage }: Omit<Props, 'userId'>) {
  const { user } = useAuth();
  
  return (
    <ErrorBoundaryCore userId={user?.uid} fallbackTitle={fallbackTitle} fallbackMessage={fallbackMessage}>
      {children}
    </ErrorBoundaryCore>
  );
}
