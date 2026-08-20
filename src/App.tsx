import { Link, Route, Routes } from "react-router";
import { FeedPage } from "./pages/FeedPage";
import { PostPage } from "./pages/PostPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import "./index.css";

/**
 * The root component: renders the header, then <Routes>/<Route> picks
 * which page to show based on the current URL.
 */
export function App() {
  return (
    <div className="app">
      <header>
        {/* <Link> renders an <a> tag, but React Router intercepts the
           click and updates the page instantly, without asking the
           server for a whole new page (that's "client-side routing"). */}
        <Link to="/">Y.com</Link>
      </header>

      <Routes>
        {/* When the URL is exactly "/", show the feed of all posts —
           including the "new post" form, which lives inline on this page
           rather than its own route. See SNIPPETS.md ("Routing"). */}
        <Route path="/" element={<FeedPage />} />
        {/* ":id" is a route param — React Router captures whatever's in
           the URL there, read inside PostPage via useParams(). */}
        <Route path="/posts/:id" element={<PostPage />} />
        {/* Matches anything not matched above — must be listed last, since <Routes> checks routes in order. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
