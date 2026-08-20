import { useEffect, useRef, useState } from "react";
import { fetchPosts, type Post } from "../api/posts";

export interface NewPostInput {
  title: string;
  body: string;
}

/**
 * Loads the feed — or search results, if `query` is non-empty — and gives
 * FeedPage a couple of functions to change what's shown afterwards.
 */
export function useFeed(query: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Counts down from -1 for locally-created posts' ids — see addPost
  // below. A ref (not state) because changing it should never itself
  // trigger a re-render; it's only ever read at the moment a post is
  // created.
  const nextLocalId = useRef(-1);

  // How many posts we've fetched from the server for the current query —
  // i.e. the `skip` to use for the next page. A ref, not state: it's only
  // ever read from loadMore (an event handler), never during render, so
  // updating it shouldn't itself trigger a re-render.
  const loadedCount = useRef(0);

  // Which query loadMore's response should be allowed to apply to. Kept
  // in sync with `query` below, same guard purpose as `cancelled` in the
  // effect: without it, clicking "Load more" and then changing the search
  // before that request resolves would splice the old query's page-2
  // results onto the new query's page-1 list once it comes back late.
  const activeQuery = useRef(query);

  useEffect(() => {
    // Guards against a slow response for an old query overwriting a newer
    // one if it resolves out of order — see SNIPPETS.md ("Side effects: useEffect").
    let cancelled = false;
    activeQuery.current = query;
    setLoading(true);
    setError(null);

    fetchPosts(query)
      .then(data => {
        if (cancelled) return;
        setPosts(data.posts);
        setTotal(data.total);
        loadedCount.current = data.posts.length;
      })
      .catch(err => {
        // Logged so a real bug (e.g. a typo'd URL) is visible in the
        // console — the UI only ever shows the friendly message below.
        console.error(err);
        if (!cancelled) setError("Something went wrong while loading the posts.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Re-runs whenever the search query changes, or retry() bumps `attempt`.
  }, [query, attempt]);

  return {
    posts,
    // Only meaningful once loadedCount catches up with what's on screen —
    // by then this tells FeedPage whether a "Load more" button is due.
    hasMore: loadedCount.current < total,
    loading,
    loadingMore,
    error,
    retry: () => setAttempt(a => a + 1),

    // Fetches the next page (picking up from loadedCount) and appends it
    // to what's already shown, instead of replacing it — unlike the
    // effect above, which is a fresh query.
    loadMore: () => {
      const requestQuery = query;
      setLoadingMore(true);
      fetchPosts(query, loadedCount.current)
        .then(data => {
          // The search changed while this was in flight — its results
          // belong to a query that's no longer on screen, so drop them.
          if (requestQuery !== activeQuery.current) return;
          setPosts(prev => [...prev, ...data.posts]);
          setTotal(data.total);
          loadedCount.current += data.posts.length;
        })
        .catch(err => {
          console.error(err);
          if (requestQuery === activeQuery.current) setError("Something went wrong while loading more posts.");
        })
        .finally(() => setLoadingMore(false));
    },

    // dummyjson doesn't actually persist anything, so instead of calling
    // the real endpoint and trusting the response, we build the post
    // client-side and mark it `local: true` — PostCard/useDeletePost use
    // that to skip linking/deleting on the server.
    addPost: (input: NewPostInput) => {
      const newPost: Post = {
        id: nextLocalId.current--,
        title: input.title,
        body: input.body,
        tags: [],
        reactions: { likes: 0, dislikes: 0 },
        views: 0,
        userId: 0,
        local: true,
      };
      setPosts(prev => [newPost, ...prev]);
    },

    // Called once a post has actually been removed — either the DELETE
    // request succeeded, or it was local-only to begin with and there was
    // nothing to delete on the server. See hooks/useDeletePost.ts.
    removePost: (id: number) => {
      setPosts(prev => prev.filter(post => post.id !== id));
    },
  };
}
