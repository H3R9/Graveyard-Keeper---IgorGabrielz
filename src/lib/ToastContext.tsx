import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Trophy } from 'lucide-react';
import { cn } from './utils';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'achievement';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  addToast: (message: string, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const VARIANTS: Record<ToastVariant, any> = {
  success: {
    icon: CheckCircle2,
    baseClass: 'border-accent-green bg-[rgba(20,30,20,0.95)]',
    textClass: 'text-accent-green',
    iconClass: 'text-accent-green',
    shadow: 'shadow-[0_0_15px_rgba(56,94,46,0.3)]'
  },
  error: {
    icon: XCircle,
    baseClass: 'border-accent-red bg-[rgba(30,15,15,0.95)]',
    textClass: 'text-accent-red',
    iconClass: 'text-accent-red',
    shadow: 'shadow-[0_0_15px_rgba(139,30,30,0.3)]'
  },
  warning: {
    icon: AlertTriangle,
    baseClass: 'border-border-gold bg-[rgba(30,25,15,0.95)]',
    textClass: 'text-border-gold',
    iconClass: 'text-border-gold',
    shadow: 'shadow-[0_0_15px_rgba(166,124,61,0.3)]'
  },
  info: {
    icon: Info,
    baseClass: 'border-accent-blue bg-[rgba(15,20,30,0.95)]',
    textClass: 'text-accent-blue',
    iconClass: 'text-accent-blue',
    shadow: 'shadow-[0_0_15px_rgba(42,75,124,0.3)]'
  },
  achievement: {
    icon: Trophy,
    baseClass: 'border-border-gold bg-[rgba(139,107,50,0.15)] backdrop-blur-lg border-2',
    textClass: 'text-border-gold font-pixel drop-shadow-md',
    iconClass: 'text-border-gold animate-bounce',
    shadow: 'shadow-[0_0_30px_rgba(166,124,61,0.6)]'
  }
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, variant }];
      if (newToasts.length > 3) {
        return newToasts.slice(newToasts.length - 3);
      }
      return newToasts;
    });

    const timeoutMs = variant === 'achievement' ? 6000 : 4000;
    setTimeout(() => {
      removeToast(id);
    }, timeoutMs);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Portaled-like fixed container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const config = VARIANTS[toast.variant];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={cn(
                  'pointer-events-auto flex items-start p-3 w-72 sm:w-80 border backdrop-blur-md rounded-sm relative overflow-hidden',
                  config.baseClass,
                  config.shadow
                )}
              >
                {toast.variant === 'achievement' && (
                   <div className="absolute inset-0 pointer-events-none achievement-particles opacity-30" />
                )}
                
                <div className="flex-shrink-0 mt-0.5">
                  <Icon size={18} className={config.iconClass} />
                </div>
                <div className="ml-3 flex-1">
                  {toast.variant === 'achievement' && <span className="text-[10px] uppercase font-pixel tracking-widest text-border-gold mb-1 block">Conquista</span>}
                  <p className={cn("text-sm font-sans font-medium leading-snug", toast.variant === 'achievement' ? 'text-border-gold' : 'text-text-parchment')}>
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity z-10"
                >
                  <X size={16} className="text-text-muted hover:text-text-parchment" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
