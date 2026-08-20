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
