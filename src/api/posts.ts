/**
 * Talks to our "mock backend": https://dummyjson.com/docs/posts — a free
 * fake API. You can fetch/create/delete posts through it, but nothing is
 * actually saved (see addPost in hooks/useFeed.ts for how the app works
 * around that). All network requests live here so the rest of the app
 * never writes fetch(...) directly, and gets typed responses for free.
 */

const BASE_URL = "https://dummyjson.com";
const LIMIT = 100;

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: { likes: number; dislikes: number };
  views: number;
  // True for a post created locally this session, never sent to the
  // server — see hooks/useFeed.ts's addPost. Absent on real posts.
  local?: boolean;
}

export interface Comment {
  id: number;
  body: string;
  user: { fullName: string };
}

export interface PostsPage {
  posts: Post[];
  // How many posts exist in total (across all pages) — lets the caller
  // know whether there's anything left to load.
  total: number;
}

/**
 * Get the posts for the feed — the most recent ones, or search results if
 * `query` is given (non-empty). Both endpoints return the same shape of
 * response (`{ posts: [...], total: ... }`), just via a different path.
 */
export async function fetchPosts(query: string): Promise<PostsPage> {
  const path = query
    ? `/posts/search?q=${encodeURIComponent(query)}&limit=${LIMIT}`
    : `/posts?limit=${LIMIT}`;

  const res = await fetch(`${BASE_URL}${path}`);
  // `fetch()` does NOT throw on a 404/500 — you have to check `res.ok`
  // yourself, a common beginner gotcha. Every function below does this
  // same check right after its own `fetch()` call.
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);

  const data = await res.json();
  return { posts: data.posts, total: data.total };
}

/** Get a single post by its id, for the post detail page. */
export async function fetchPost(id: number): Promise<Post> {
  const res = await fetch(`${BASE_URL}/posts/${id}`);
  if (!res.ok) throw new Error(`GET /posts/${id} failed: ${res.status}`);

  return res.json();
}

/** Get the comments that belong to a single post. */
export async function fetchComments(postId: number): Promise<Comment[]> {
  const res = await fetch(`${BASE_URL}/posts/${postId}/comments`);
  if (!res.ok) throw new Error(`GET /posts/${postId}/comments failed: ${res.status}`);

  const data = await res.json();
  return data.comments;
}

/**
 * Ask the API to delete a post. We still make the real request (rather
 * than skipping it) so the app behaves like it would against a real
 * backend; `hooks/useFeed.ts` is what actually removes the post from
 * what's shown on screen afterwards.
 */
export async function deletePost(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/posts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE /posts/${id} failed: ${res.status}`);
}
