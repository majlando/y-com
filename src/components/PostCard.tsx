import { Link } from "react-router";
import type { Post } from "../api/posts";
import { useDeletePost } from "../hooks/useDeletePost";

interface PostCardProps {
  post: Post;
  // Called once the delete has already gone through (see useDeletePost
  // below), so FeedPage can remove this post from the list it's showing.
  onDelete: (id: number) => void;
}

/**
 * Renders a single post inside the feed: its title (as a link to the full
 * post), a preview of the body, its tags, and a delete button.
 */
export function PostCard({ post, onDelete }: PostCardProps) {
  // A post created locally this session only exists in memory — there's
  // no real page for it at "/posts/<id>" (fetchPost would just fail), so
  // its title isn't a link. See hooks/useFeed.ts's addPost.
  const isLocal = post.local === true;

  // Handles the confirm dialog and the actual DELETE request; we just
  // tell it what to do once that's finished — remove this post from the
  // list it's shown in.
  const { deleting, error, handleDelete } = useDeletePost(post.id, isLocal, () => onDelete(post.id));

  return (
    <article className="post">
      <h2>{isLocal ? post.title : <Link to={`/posts/${post.id}`}>{post.title}</Link>}</h2>
      {/* "post-preview" clips the body to a few lines — in the feed we
         only need enough text to decide whether to open the post; the
         full body still shows uncropped on PostPage. */}
      <p className="post-preview">{post.body}</p>

      {post.tags.length > 0 && (
        <div className="tags">
          {post.tags.map((tag, i) => (
            <span key={`${tag}-${i}`} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <p className="muted post-stats">
        {post.reactions.likes} likes · {post.views} views
      </p>

      <div className="actions">
        <button type="button" className="danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {error && (
        <p role="alert" className="muted">
          {error}
        </p>
      )}
    </article>
  );
}
