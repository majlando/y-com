import { useEffect, useRef } from "react";
import { useDeletePost } from "../hooks/useDeletePost";

interface DeleteButtonProps {
  postId: number;
  isLocal: boolean;
  onDeleted: () => void;
  // "Delete" in the feed (PostCard), "Delete post" on the detail page
  // (PostPage) — same button, different amount of surrounding context.
  label: string;
}

/**
 * The delete button for a post, plus its confirmation step: a click swaps
 * the button for a "Delete this post? / Yes, delete / Cancel" prompt in
 * place, rather than the browser's native confirm() dialog.
 */
export function DeleteButton({ postId, isLocal, onDeleted, label }: DeleteButtonProps) {
  const { confirming, deleting, requestDelete, cancelDelete, confirmDelete } = useDeletePost(
    postId,
    isLocal,
    onDeleted,
  );

  // The "Delete" button that opens the confirm prompt isn't in the DOM
  // once it's open, so cancelling needs an explicit target to hand focus
  // back to — otherwise it'd silently fall to <body>.
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleCancel() {
    cancelDelete();
    triggerRef.current?.focus();
  }

  // Escape cancels the confirm prompt, same as clicking "Cancel" — mirrors
  // the Escape-closes-the-create-form behavior in FeedPage.tsx.
  useEffect(() => {
    if (!confirming) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confirming]);

  return (
    <div className="actions">
      {confirming ? (
        <>
          <span className="confirm-prompt">Delete this post?</span>
          <button type="button" className="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Yes, delete"}
          </button>
          {/* autoFocus — Cancel is the safer default landing spot for
             keyboard focus once the button that had it (below) disappears. */}
          <button type="button" autoFocus onClick={handleCancel} disabled={deleting}>
            Cancel
          </button>
        </>
      ) : (
        <button type="button" ref={triggerRef} className="danger" onClick={requestDelete}>
          {label}
        </button>
      )}
    </div>
  );
}
