import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const typeStyles = {
  success: {
    icon: CheckCircle2,
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  error: {
    icon: XCircle,
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  info: {
    icon: Info,
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
};

const ToastViewport = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 w-[320px] max-w-[90vw]">
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = typeStyles[toast.type] || typeStyles.info;
          const Icon = style.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className={`glass ${style.bg} ${style.border} border rounded-2xl p-4 shadow-2xl`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${style.text}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  {toast.title && (
                    <p className="text-sm font-bold text-foreground mb-1">{toast.title}</p>
                  )}
                  {toast.message && (
                    <p className="text-xs text-muted-foreground font-medium">{toast.message}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastViewport;
