import { EyeIcon, HeartIcon } from "./Icons";

interface PostStatsProps {
  likes: number;
  views: number;
}

/**
 * A post's likes/views line — shared by PostCard.tsx and PostPage.tsx. The
 * icons are aria-hidden (see Icons.tsx), so each number gets a visually
 * hidden word after it — otherwise a screen reader would just read two
 * bare numbers with nothing saying what they count.
 */
export function PostStats({ likes, views }: PostStatsProps) {
  return (
    <p className="muted post-stats">
      <span className="post-stat">
        <HeartIcon /> {likes}
        <span className="sr-only"> likes</span>
      </span>
      <span className="post-stat">
        <EyeIcon /> {views}
        <span className="sr-only"> views</span>
      </span>
    </p>
  );
}
