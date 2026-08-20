# COMMANDS

## Setup

```bash
bun install
bun add <package>       # add a dependency
bun remove <package>    # remove one
```

## Development

```bash
bun dev              # start with hot reload, at localhost:3000
bun run typecheck    # check for TypeScript errors, no build
```

## Production (no Docker)

```bash
bun run start         # run the way Docker runs it (no --hot)
PORT=8080 bun run start
```

## Static build

For deploying to a plain static file host instead of running `bun run
start` (i.e. no Bun server at all — just files served over HTTP):

```bash
bun run build          # bundles src/index.html into dist/
bunx serve -s dist     # try it locally
```

`dist/` is `index.html` plus hashed, minified JS/CSS — upload it as-is.
The app uses client-side routing (React Router), so the static host
**must** fall back to `index.html` for unknown paths (e.g. `/posts/7`
loaded directly), or those URLs 404. That's what `-s`/`--single` does for
`serve` above; other hosts call this a "SPA fallback" or "rewrite rule"
(e.g. nginx's `try_files $uri /index.html;`).

## Docker / Podman

`Dockerfile` installs deps and runs the server from `oven/bun:1-alpine` —
no separate build step, Bun bundles on request. Podman is a drop-in
replacement — swap `docker` for `podman` below.

```bash
docker build -t y-com .
docker run -d --name y-com -p 3000:3000 y-com
docker logs -f y-com
docker stop y-com
docker rm -f y-com
docker rmi y-com
```
