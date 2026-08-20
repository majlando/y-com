import { useState } from "react";
import { deletePost } from "../api/posts";

/**
 * Shared by PostCard (in the feed) and PostPage (the detail page), via
 * DeleteButton — so both get the same confirm + loading + error handling
 * for free, instead of each page repeating it. Confirmation is a second
 * in-place click (see `confirming`) rather than the browser's native
 * confirm() dialog, which can't be styled to match the rest of the app.
 */
export function useDeletePost(postId: number, isLocal: boolean, onDeleted: () => void) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    setConfirming(false);

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

  return {
    confirming,
    deleting,
    error,
    requestDelete: () => setConfirming(true),
    cancelDelete: () => setConfirming(false),
    confirmDelete,
  };
}
