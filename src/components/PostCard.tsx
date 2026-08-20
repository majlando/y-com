import { Link, useLocation } from "react-router";
import type { Post } from "../api/posts";
import { DeleteButton } from "./DeleteButton";
import { PostStats } from "./PostStats";

interface PostCardProps {
  post: Post;
  // Called once the delete has already gone through (see DeleteButton /
  // useDeletePost), so FeedPage can remove this post from the list it's
  // showing.
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

  // Passed as link state so PostPage's "← Back" can return here with the
  // current search still applied, instead of always landing on the
  // unfiltered feed — see PostPage.tsx.
  const location = useLocation();

  return (
    <article className="post">
      <h2>
        {isLocal ? (
          post.title
        ) : (
          <Link to={`/posts/${post.id}`} state={{ from: location.pathname + location.search }}>
            {post.title}
          </Link>
        )}
      </h2>
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

      <PostStats likes={post.reactions.likes} views={post.views} />

      <DeleteButton postId={post.id} isLocal={isLocal} onDeleted={() => onDelete(post.id)} label="Delete" />
    </article>
  );
}
