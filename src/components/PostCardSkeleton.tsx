/**
 * Stands in for a real PostCard while the feed's first page is loading —
 * mirrors a card's shape (title + a few body lines) so the layout is
 * visible immediately instead of a blank moment before content pops in.
 * Purely decorative, so it's hidden from screen readers.
 */
export function PostCardSkeleton() {
  return (
    <div className="post" aria-hidden="true">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-short" />
    </div>
  );
}
