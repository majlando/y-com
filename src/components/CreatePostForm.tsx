import { useState, type SyntheticEvent } from "react";
import type { NewPostInput } from "../hooks/useFeed";

interface CreatePostFormProps {
  // Adds the post — see hooks/useFeed.ts's addPost. It's local-only and
  // synchronous (dummyjson never really saves it), so there's no loading
  // state to track here, unlike a form that waits on a real API call.
  onCreate: (input: NewPostInput) => void;
  // Called right after a successful submit, so FeedPage can collapse the
  // form back down.
  onDone: () => void;
}

/** A small inline form for creating a new post: a title, a body, and a submit button. */
export function CreatePostForm({ onCreate, onDone }: CreatePostFormProps) {
  // Each text field gets its own piece of state. This pattern is called a
  // "controlled input": the <input>'s displayed value always comes from
  // React state (`value={title}`), and every keystroke updates that state
  // (`onChange`). This is different from plain HTML, where the browser
  // manages an input's value for you.
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function handleSubmit(e: SyntheticEvent) {
    // preventDefault() stops the browser's default page-reload-on-submit.
    // This only runs once the browser's own `required` validation passes.
    e.preventDefault();

    // `required` alone doesn't stop a whitespace-only value — a single
    // space passes the browser's built-in check just fine — so trim
    // before checking there's actually something to post.
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) return;

    onCreate({ title: trimmedTitle, body: trimmedBody });
    setTitle("");
    setBody("");
    onDone();
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <h2>New Post</h2>

      <label htmlFor="post-title">Title</label>
      <input id="post-title" required autoFocus value={title} onChange={e => setTitle(e.target.value)} />

      <label htmlFor="post-body">Post</label>
      <textarea
        id="post-body"
        required
        placeholder="What's on your mind?"
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={3}
      />

      <button type="submit" className="primary-button">
        Post
      </button>
    </form>
  );
}
