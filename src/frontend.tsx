/**
 * This file is the entry point for the React app: it finds the empty
 * <div id="root"> from index.html and tells React to render our <App />
 * component into it. It's loaded by the <script type="module"> tag inside
 * index.html.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App";

const elem = document.getElementById("root")!;

const app = (
  // StrictMode is a development-only helper from React. It doesn't render
  // anything itself — it just runs some of your code twice on purpose, to
  // help you notice bugs (like accidental side effects) earlier. It has no
  // effect in a production build.
  <StrictMode>
    {/* BrowserRouter turns on client-side routing: it reads and writes
       the browser's URL, and lets the <Routes>/<Route> elements inside
       <App /> decide what to show — without a full page reload every
       time the URL changes. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
(import.meta.hot.data.root ??= createRoot(elem)).render(app);
