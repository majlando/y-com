// This file starts our Bun server. Bun is a fast all-in-one JavaScript
// runtime — similar to Node.js, but faster and with a lot more built in.
// `Bun.serve()` starts an HTTP server; we don't need a separate framework
// like Express for a project this size.
import { serve } from "bun";

// Importing an HTML file lets Bun auto-bundle the TS/CSS it references —
// see SNIPPETS.md ("Bun as backend + bundler"). Bun bundles it on the fly
// on every request; fine for a small learning app, no separate build step.
import index from "./index.html";

const server = serve({
  // The port the server listens on. Hosting platforms (and our Dockerfile)
  // often set the PORT environment variable, so we use that if it exists,
  // and fall back to 3000 for local development.
  port: Number(process.env.PORT) || 3000,

  // "/*" matches every URL and always serves the same bundled HTML+JS —
  // React Router (in the browser) is what actually decides what to show,
  // including for paths the server knows nothing about (e.g. "/posts/42").
  routes: { "/*": index },

  // Turns on extra developer tools: Hot Module Reloading (HMR, which
  // updates the page in your browser instantly when you save a file),
  // forwarding browser console.log() calls to this terminal, and detailed
  // stack traces on a server error. Only for local dev (`bun dev`) — the
  // Dockerfile sets NODE_ENV=production, so `bun run start`/Docker ship
  // the real, minified React build with none of that exposed to users.
  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);

// Without this, stopping the container (e.g. `docker stop`, a rolling
// deploy, `podman stop`) has nothing to catch SIGTERM: this process runs
// as PID 1 in the container, and an unhandled signal there is silently
// ignored by the kernel rather than terminating it like it would for any
// other process — so every stop sits out the full grace period before
// being force-killed with SIGKILL instead of shutting down immediately.
process.on("SIGTERM", () => {
  server.stop();
  process.exit(0);
});
