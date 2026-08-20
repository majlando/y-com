/**
 * Small inline icons used next to a post's stats (see PostStats.tsx).
 * aria-hidden — the numbers next to them already carry the meaning
 * ("N likes", "N views"), so these are decorative, not content.
 */

export function HeartIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="var(--like)">
      <path d="M12 20.3 4.6 13c-2.1-2.1-2.1-5.5 0-7.6 2.1-2.1 5.5-2.1 7.4.1 1.9-2.2 5.3-2.2 7.4-.1 2.1 2.1 2.1 5.5 0 7.6L12 20.3z" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}
