import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, message, type }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 4200);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5 pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const borderColor =
              toast.type === 'success'
                ? 'border-[#10B981]/40'
                : toast.type === 'error'
                ? 'border-[#E11D48]/40'
                : 'border-[#0070F3]/40';

            const iconColor =
              toast.type === 'success'
                ? 'text-[#0D9F6E]'
                : toast.type === 'error'
                ? 'text-[#E11D48]'
                : 'text-[#0070F3]';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${borderColor} bg-white p-3.5 shadow-xl shadow-[#0070F3]/10`}
              >
                <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                  {toast.type === 'success' && <CheckCircle2 className="h-4.5 w-4.5" />}
                  {toast.type === 'error' && <AlertCircle className="h-4.5 w-4.5" />}
                  {toast.type === 'info' && <Info className="h-4.5 w-4.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#05080F]">{toast.title}</p>
                  {toast.message && (
                    <p className="mt-0.5 text-xs leading-relaxed text-[#334155]">{toast.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-lg p-1 text-[#334155] transition-colors hover:bg-[#EFF6FF] hover:text-[#05080F]"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
