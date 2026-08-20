import { useEffect, useState } from "react";
import { fetchComments, fetchPost, type Comment, type Post } from "../api/posts";

/**
 * Loads one post and its comments together, for PostPage ("/posts/:id").
 */
export function usePost(postId: number) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Guards against a slow response overwriting newer data if the user
    // navigates away (e.g. to a different post) before this resolves —
    // see SNIPPETS.md ("Side effects: useEffect").
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchPost(postId), fetchComments(postId)])
      .then(([postData, commentsData]) => {
        if (cancelled) return;
        setPost(postData);
        setComments(commentsData);
      })
      .catch(err => {
        console.error(err);
        if (!cancelled) setError("Something went wrong while loading this post.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Re-runs whenever the post id changes, or retry() bumps `attempt`.
  }, [postId, attempt]);

  return {
    post,
    comments,
    loading,
    error,
    // Changing `attempt` makes the effect above run again.
    retry: () => setAttempt(a => a + 1),
  };
}
