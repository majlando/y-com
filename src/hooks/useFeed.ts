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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Counts down from -1 for locally-created posts' ids — see addPost
  // below. A ref (not state) because changing it should never itself
  // trigger a re-render; it's only ever read at the moment a post is
  // created.
  const nextLocalId = useRef(-1);

  useEffect(() => {
    // Guards against a slow response for an old query overwriting a newer
    // one if it resolves out of order — see SNIPPETS.md ("Side effects: useEffect").
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPosts(query)
      .then(data => {
        if (cancelled) return;
        setPosts(data.posts);
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
    loading,
    error,
    retry: () => setAttempt(a => a + 1),

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
