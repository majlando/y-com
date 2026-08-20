# SNIPPETS

Key React/TypeScript/Bun patterns used in this app, and why. 

## Project structure

```
src/
  api/posts.ts                      # all network requests
  hooks/                            # data + state per page: useFeed, usePost, useDeletePost
                                     # + useToast, the one app-wide exception (see below)
  components/                       # reusable UI: PostCard, CreatePostForm, DeleteButton,
                                     # ErrorState, PostStats, Icons, ToastStack
  pages/                            # one file per route: FeedPage, PostPage, NotFoundPage
  App.tsx, frontend.tsx, server.ts, index.html   # entry points
  index.css                          # global styles, imported by App.tsx
```

## Components & props

A component is a function returning JSX. Inputs come in as **props**:

```tsx
export function PostCard({ post, onDelete }: PostCardProps) {
  return <article><h2>{post.title}</h2></article>;
}
// <PostCard post={p} onDelete={fn} />
```

Lists use `.map` + a stable `key` so React can track rows across
re-renders: `posts.map(p => <PostCard key={p.id} .../>)`.

## State: `useState`

```tsx
const [title, setTitle] = useState("");
<input value={title} onChange={e => setTitle(e.target.value)} />
```

A "controlled input" — React owns the value, so it can be read or reset
(e.g. clearing the form after submit). Also used for simple flags, like
`deleting` in `useDeletePost`, to disable a button mid-request.

## Side effects: `useEffect`

Anything reaching outside React (an API call) goes here. Both data hooks
guard against out-of-order responses with a `cancelled` flag, and log the
real error to the console before showing a friendly message:

```tsx
useEffect(() => {
  let cancelled = false;
  fetchPost(postId)
    .then(data => { if (!cancelled) setPost(data); })
    .catch(err => { console.error(err); if (!cancelled) setError("Something went wrong…"); });
  return () => { cancelled = true; }; // cleanup: runs before next effect / unmount
}, [postId, attempt]);
```

Without `cancelled`, navigating from post 1 → post 2 quickly could let
post 1's slow response overwrite post 2's data. `attempt` is a counter
bumped by a `retry()` function — that's what makes "Try again" re-run the
effect. `useFeed` and `usePost` each write this out in full rather than
sharing a helper — two similar-looking effects are easier to read
top-to-bottom than one generic hook both of them funnel through.

## Custom hooks: one per page

A function starting with `use` that can call other hooks. Each page owns
one, holding its data + loading/error state + actions:

```tsx
const { posts, loading, error, addPost, removePost } = useFeed(debouncedQuery);
```

State lives and dies with the page (no shared Context) for everything
above — simpler, and fine for a demo of a fake API. `useToast` (below) is
the one deliberate exception.

**Why `addPost` never calls the API:** dummyjson doesn't actually persist
anything, so a real `POST` would look like it worked but vanish on the
next `GET`. Instead the post is built client-side and prepended to local
state, marked `local: true` — `PostCard` and `useDeletePost` check that
flag to skip rendering a dead link / calling a delete on the server.

`deletePost` *does* still call the real `DELETE` endpoint — dummyjson
just doesn't actually remove anything, so the app behaves like it would
against a real backend, without trusting the response.

## Sharing logic: `useDeletePost`

Confirm → call API (unless `isLocal`) → track `confirming`/`deleting`. Used
by both `PostCard` and `PostPage`, each passing its own `isLocal` +
`onDeleted`:

```tsx
useDeletePost(post.id, post.local === true, () => onDelete(post.id));   // PostCard: remove from list
useDeletePost(postId, post?.local === true, () => navigate("/"));       // PostPage: navigate away
```

A failed delete surfaces via `useToast` (below), not its own `error`
state — the button already knows how to revert to its default, retryable
look on failure, so all that's left to do is tell the user why.

## Sharing state across the app: `useToast`

The one exception to "state lives and dies with the page" above. A failed
delete or a failed "Load more" can happen from *any* page, so the toast
list they both write to has to live above routing, not inside one page's
hook:

```tsx
// App.tsx
<ToastProvider>
  <div className="app">...<Routes>...</Routes></div>
</ToastProvider>

// anywhere below it, e.g. hooks/useDeletePost.ts
const { showToast } = useToast();
showToast("Could not delete this post.", "error");
```

`useToast()` throws if called outside `ToastProvider` — since the provider
already wraps the whole app in `App.tsx`, that should never happen; the
throw is just a loud failure instead of a silently-dropped toast if that
ever changes. Reserved for one-off failures that shouldn't disturb the
surrounding layout (a card list, a page) — a failure that blocks all
content (the initial feed/post load) still gets an inline `ErrorState` +
"Try again" instead, since that needs a persistent way to recover, not a
message that fades on its own.

## Searching: synced to the URL

The search box's live value is plain `useState`, so typing feels instant.
It's debounced (300ms after typing stops) into the URL's `?q=` param via
React Router's `useSearchParams`, instead of separate state — so a search
is bookmarkable/shareable and survives a refresh:

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

useEffect(() => {
  const t = setTimeout(() => {
    setSearchParams(query ? { q: query } : {}, { replace: true });
  }, 300);
  return () => clearTimeout(t);
}, [query]);

const debouncedQuery = searchParams.get("q") ?? "";
```

`{ replace: true }` updates the URL without adding a new browser-history
entry for every keystroke's worth of typing. `useFeed` just re-fetches
whenever `debouncedQuery` (read from the URL) changes — same
effect/cancellation logic as the initial load, no separate mechanism.

## Routing: React Router

```tsx
<Routes>
  <Route path="/" element={<FeedPage />} />
  <Route path="/posts/:id" element={<PostPage />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

`:id` is read via `useParams()`; `useNavigate()` redirects after delete.
"New post" is a toggled form inline on `FeedPage`, not its own route —
since state isn't shared across pages, a `/create` route would lose the
new post the moment you navigated back to `/`.

## Talking to the API

Every function in `api/posts.ts` follows the same shape:

```ts
export async function fetchPost(id: number): Promise<Post> {
  const res = await fetch(`${BASE_URL}/posts/${id}`);
  if (!res.ok) throw new Error(`GET /posts/${id} failed: ${res.status}`);
  return res.json();
}
```

`fetch()` does **not** throw on 404/500 — you must check `res.ok`
yourself. `Post`/`Comment` are TypeScript interfaces: compile-time only,
zero runtime cost.

## Bun as backend + bundler

```ts
import index from "./index.html";
serve({ routes: { "/*": index } });
```

Importing HTML lets Bun bundle its TS/CSS automatically — no
Webpack/Vite. The `"/*"` wildcard always returns the same page, so
client-side routing (React Router) can decide what to show for any URL,
including ones the server knows nothing about (e.g. `/posts/42`). Bun
bundles on the fly on every request — one code path, no separate build
step, even in Docker. See `docs/COMMANDS.md` for Docker.
