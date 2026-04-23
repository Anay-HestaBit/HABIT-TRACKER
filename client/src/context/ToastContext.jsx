import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const defaultDuration = 4000;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(({ type = 'info', title, message, duration = defaultDuration }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast = { id, type, title, message };
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      window.setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [removeToast]);

  const value = useMemo(() => ({ toasts, pushToast, removeToast }), [toasts, pushToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
