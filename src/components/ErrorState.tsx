interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

/**
 * A blocking error (feed load, search, post load) plus a "Try again"
 * button — shared by FeedPage and PostPage so the two identical error+retry
 * blocks don't drift out of sync. Distinct from a toast: this is for
 * failures that leave nothing else worth showing, so it needs a persistent,
 * discoverable way to recover rather than a message that fades on its own.
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      {/* Decorative — the <p role="alert"> below is what's actually announced. */}
      <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="0.9" fill="currentColor" />
      </svg>
      <p role="alert">{message}</p>
      <button type="button" className="primary-button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
