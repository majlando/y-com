import { Link } from "react-router";

/**
 * Shown when the URL doesn't match any route defined in App.tsx — e.g. a
 * typo'd link, or a bookmark to a post that's since been deleted. React
 * Router only renders this one when nothing more specific above it (in
 * the <Routes> list) matched, since it's registered last with the
 * wildcard path "*".
 */
export function NotFoundPage() {
  return (
    <div>
      <h1>Page not found</h1>
      <p className="muted empty-state">There's nothing at this address.</p>
      <Link to="/">← Back to the feed</Link>
    </div>
  );
}
