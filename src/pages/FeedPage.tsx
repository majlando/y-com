import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useFeed } from "../hooks/useFeed";
import { PostCard } from "../components/PostCard";
import { PostCardSkeleton } from "../components/PostCardSkeleton";
import { CreatePostForm } from "../components/CreatePostForm";
import { ErrorState } from "../components/ErrorState";

/**
 * The home page (route "/"): a toolbar (search + new post), then the list
 * of posts. See SNIPPETS.md ("Routing") for why "new post" lives inline
 * on this page instead of its own route.
 */
export function FeedPage() {
  // The search box's live value is plain component state, so every
  // keystroke feels instant. It's debounced (300ms after typing stops)
  // into the URL's "?q=" param instead of separate state, so a search is
  // bookmarkable/shareable and survives a refresh — see SNIPPETS.md
  // ("Searching").
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchParams(query ? { q: query } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);
  const debouncedQuery = searchParams.get("q") ?? "";

  // useFeed fetches the main feed when `debouncedQuery` is empty, or
  // search results when it isn't — see hooks/useFeed.ts.
  const { posts, hasMore, remaining, loading, loadingMore, error, retry, addPost, removePost, loadMore } =
    useFeed(debouncedQuery);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const newPostButtonRef = useRef<HTMLButtonElement>(null);

  function closeCreateForm() {
    setShowCreateForm(false);
    // Neither this nor the form's own "Cancel" button leaves focus
    // anywhere once the form unmounts — send it back to the toggle that
    // opened the form instead of letting it fall through to the page.
    newPostButtonRef.current?.focus();
  }

  // Escape collapses the create-post form, same as clicking "Cancel" —
  // only listens while the form is actually open.
  useEffect(() => {
    if (!showCreateForm) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCreateForm();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showCreateForm]);

  return (
    <div>
      {/* Every other page (PostPage, NotFoundPage) opens with an <h1> —
         this one does too, so the feed doesn't jump straight from the
         header link into <h2> post titles with nothing in between for a
         screen reader to land on. */}
      <h1>Your Feed</h1>

      {/* Search and "create a post" are different tasks — finding vs.
         writing — so they get their own toolbar row, kept visually
         separate from the feed below. */}
      <div className="feed-toolbar">
        {/* Visually hidden — the placeholder text already communicates
           this input's purpose to sighted users, but screen readers skip
           placeholders, so a real (if visually hidden) <label> is still
           needed to announce what the field is for. */}
        <label htmlFor="post-search" className="sr-only">
          Search posts
        </label>
        <div className="search-field">
          <input
            id="post-search"
            ref={searchInputRef}
            type="search"
            placeholder="Search posts…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                searchInputRef.current?.focus();
              }}
            >
              ×
            </button>
          )}
        </div>
        <button
          type="button"
          ref={newPostButtonRef}
          className="primary-button"
          onClick={() => setShowCreateForm(show => !show)}
        >
          {showCreateForm ? "Cancel" : "+ New Post"}
        </button>
      </div>

      {showCreateForm && <CreatePostForm onCreate={addPost} onDone={closeCreateForm} />}

      {error && <ErrorState message={error} onRetry={retry} />}

      {!loading && !error && posts.length === 0 && (
        <p className="muted empty-state">{debouncedQuery ? `No posts found for "${debouncedQuery}".` : "No posts found."}</p>
      )}

      {/* Hidden on error — the list below could be stale (e.g. left over
         from before a failed search), and showing it next to an error
         banner reads as contradictory. */}
      {!error && (
        <div className={`post-list${loading && posts.length > 0 ? " post-list-loading" : ""}`}>
          {loading && posts.length === 0
            ? // The very first load, before there's anything real to show —
              // three placeholder cards instead of a bare "Loading…" line,
              // so the feed's layout is visible right away. A search
              // re-fetch also sets `loading`, but by then real results are
              // already on screen, so it dims them (above) instead of
              // swapping in skeletons on every keystroke.
              Array.from({ length: 3 }, (_, i) => <PostCardSkeleton key={i} />)
            : posts.map(post => <PostCard key={post.id} post={post} onDelete={removePost} />)}
        </div>
      )}

      {/* Only the first page loads up front — hasMore (from the `total`
         the API reports) tells us whether there's another page to fetch.
         Hidden during the initial/search loading state above, so it
         doesn't flash on screen right before the real list appears. */}
      {!error && !loading && hasMore && (
        <div className="load-more">
          <button type="button" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : `Load more (${remaining} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}
