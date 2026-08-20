import { useState } from "react";
import { deletePost } from "../api/posts";
import { useToast } from "./useToast";

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
  const { showToast } = useToast();

  async function confirmDelete() {
    // A locally-created post (see hooks/useFeed.ts) was never sent to the
    // server, so there's nothing to delete there; just tell the caller
    // it's gone.
    if (isLocal) {
      setConfirming(false);
      onDeleted();
      return;
    }

    // Deliberately not clearing `confirming` here — DeleteButton only
    // renders its "Deleting…" state while `confirming` is still true, so
    // clearing it before the request settles would make that state
    // unreachable (both flags would flip in the same render either way,
    // since React batches these). It's reset below only on failure; on
    // success `onDeleted()` removes/navigates away from this component,
    // so there's nothing left to reset.
    setDeleting(true);

    try {
      await deletePost(postId);
      onDeleted();
    } catch {
      // A toast rather than inline text — it's a one-off failure, and the
      // button below reverts to its default (retryable) state.
      showToast("Could not delete this post.", "error");
      setDeleting(false);
      setConfirming(false);
    }
  }

  return {
    confirming,
    deleting,
    requestDelete: () => setConfirming(true),
    cancelDelete: () => setConfirming(false),
    confirmDelete,
  };
}
