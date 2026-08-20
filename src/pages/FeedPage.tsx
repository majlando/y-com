import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useFeed } from "../hooks/useFeed";
import { PostCard } from "../components/PostCard";
import { CreatePostForm } from "../components/CreatePostForm";

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
  const { posts, loading, error, retry, addPost, removePost } = useFeed(debouncedQuery);

  const [showCreateForm, setShowCreateForm] = useState(false);

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
        <input
          id="post-search"
          type="search"
          placeholder="Search posts…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="button" className="primary-button" onClick={() => setShowCreateForm(show => !show)}>
          {showCreateForm ? "Cancel" : "+ New Post"}
        </button>
      </div>

      {showCreateForm && <CreatePostForm onCreate={addPost} onDone={() => setShowCreateForm(false)} />}

      {/* Only shown on the very first load, when there's nothing else on
         screen yet. A search re-fetch also sets `loading`, but by then the
         previous results are already visible — see the dimmed post-list
         below instead of flashing this in above them on every keystroke. */}
      {loading && posts.length === 0 && <p className="muted">Loading…</p>}

      {error && (
        <>
          <p role="alert">{error}</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </>
      )}

      {!loading && !error && posts.length === 0 && <p className="muted">No posts found.</p>}

      {/* Hidden on error — the list below could be stale (e.g. left over
         from before a failed search), and showing it next to an error
         banner reads as contradictory. */}
      {!error && (
        <div className={`post-list${loading ? " post-list-loading" : ""}`}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={removePost} />
          ))}
        </div>
      )}
    </div>
  );
}
