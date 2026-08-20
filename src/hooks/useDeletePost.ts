import { useState } from "react";
import { deletePost } from "../api/posts";

/**
 * Shared by PostCard (in the feed) and PostPage (the detail page), so
 * both get the same confirm-dialog + loading + error handling for free,
 * instead of each page repeating it.
 */
export function useDeletePost(postId: number, isLocal: boolean, onDeleted: () => void) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;

    // A locally-created post (see hooks/useFeed.ts) was never sent to the
    // server, so there's nothing to delete there; just tell the caller
    // it's gone.
    if (isLocal) {
      onDeleted();
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deletePost(postId);
      onDeleted();
    } catch {
      setError("Could not delete this post.");
      setDeleting(false);
    }
  }

  return { deleting, error, handleDelete };
}
