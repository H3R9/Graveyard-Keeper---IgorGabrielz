import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './lib/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Toaster position="bottom-right" theme="dark" toastOptions={{
          style: { background: 'rgba(18,14,12,0.95)', border: '1px solid #8b6b32', color: '#e0d5ba', fontFamily: 'Inter, sans-serif' }
        }} />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);

