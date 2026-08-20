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
  // updates the page in your browser instantly when you save a file) and
  // forwarding browser console.log() calls to this terminal.
  development: true,
});

console.log(`🚀 Server running at ${server.url}`);
