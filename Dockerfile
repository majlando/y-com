FROM oven/bun:1-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --chown=bun:bun package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY --chown=bun:bun . .

# oven/bun:1-alpine already creates this user (uid 1000) — switch to it so
# the app doesn't run as root.
USER bun

EXPOSE 3000

CMD ["bun", "src/server.ts"]
