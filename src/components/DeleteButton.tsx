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

  return (
    <div className="actions">
      {confirming ? (
        <>
          <span className="confirm-prompt">Delete this post?</span>
          <button type="button" className="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Yes, delete"}
          </button>
          <button type="button" onClick={cancelDelete} disabled={deleting}>
            Cancel
          </button>
        </>
      ) : (
        <button type="button" className="danger" onClick={requestDelete}>
          {label}
        </button>
      )}
    </div>
  );
}
