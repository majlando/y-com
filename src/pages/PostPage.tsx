import { Link, useLocation, useNavigate, useParams } from "react-router";
import { usePost } from "../hooks/usePost";
import { DeleteButton } from "../components/DeleteButton";

/**
 * The post detail page (route "/posts/:id"): shows one post in full, its
 * comments, and a delete button.
 */
export function PostPage() {
  // useParams reads the dynamic part of the URL that matched ":id" in the
  // <Route path="/posts/:id"> defined in App.tsx. It's always given to us
  // as a string, so we convert it to a number to compare against post ids.
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);

  // useNavigate lets us change the current URL from code — used below to
  // send the user back to the feed after deleting this post.
  const navigate = useNavigate();

  // PostCard sets this when linking here, to whatever the feed's URL was
  // at the time (e.g. "/?q=love") — so "← Back" (and post-delete) return
  // to the same search instead of always landing on the unfiltered feed.
  // Falls back to "/" when there's no such state, e.g. a direct visit to
  // this URL.
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const { post, comments, loading, error, retry } = usePost(postId);

  // A malformed URL (e.g. "/posts/abc") makes postId NaN — fetching that
  // would just 404 into the generic error below, so catch it directly
  // instead of showing a "Try again" button that can never help.
  if (Number.isNaN(postId)) return <p>Post not found.</p>;

  // Show an explicit loading message rather than "Post not found" below —
  // `post` is still null at this point regardless of whether it'll load
  // successfully or not, and a blank page while loading reads as broken
  // rather than "in progress".
  if (loading) return <p className="muted">Loading…</p>;

  if (error) {
    return (
      <div>
        <Link to={from}>← Back</Link>
        <p role="alert">{error}</p>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  if (!post) return <p>Post not found.</p>;

  return (
    <div>
      <Link to={from}>← Back</Link>

      <article className="post">
        <h1>{post.title}</h1>
        <p>{post.body}</p>
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
        <DeleteButton postId={postId} isLocal={post.local === true} onDeleted={() => navigate(from)} label="Delete post" />
      </article>

      <h2>Comments</h2>
      {comments.length === 0 ? (
        <p className="muted">No comments yet.</p>
      ) : (
        comments.map(comment => (
          <div key={comment.id} className="comment">
            <strong>{comment.user.fullName}</strong>
            <p>{comment.body}</p>
          </div>
        ))
      )}
    </div>
  );
}
