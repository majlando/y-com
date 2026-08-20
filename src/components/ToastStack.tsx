import type { Toast } from "../hooks/useToast";

interface ToastStackProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

/**
 * The fixed-position stack rendered by ToastProvider. The wrapper stays
 * mounted even with zero toasts — a screen reader only announces updates to
 * a live region that already existed in the DOM, so conditionally rendering
 * the wrapper itself (instead of just its contents) would silently break
 * announcements for the very first toast.
 */
export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className="toast-stack" role="alert" aria-live="assertive">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button type="button" aria-label="Dismiss" className="toast-dismiss" onClick={() => onDismiss(toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
