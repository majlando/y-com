import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { ToastStack } from "../components/ToastStack";

export type ToastType = "info" | "error";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// How long a toast stays up before auto-dismissing. Manual dismissal just
// removes it from state early — `dismiss` is idempotent, so the timeout
// firing later for an already-closed toast is a harmless no-op, which is
// why there's no timer bookkeeping/cancellation here.
const AUTO_DISMISS_MS = 4500;

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Wraps the whole app (see App.tsx) so any component/hook below it can call
 * useToast() to surface a transient message — used for failures that
 * shouldn't disrupt the surrounding layout (e.g. a failed delete or a
 * failed "Load more"), as opposed to blocking errors that get an inline
 * banner + retry instead (see ErrorState.tsx).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  function dismiss(id: number) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  function showToast(message: string, type: ToastType = "info") {
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  // Should be unreachable — ToastProvider wraps the whole app in App.tsx —
  // but fails loudly instead of silently dropping toasts if that ever changes.
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
