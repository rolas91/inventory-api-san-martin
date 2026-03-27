# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build
RUN npm prune --omit=dev

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache tzdata \
 && addgroup -S appgroup \
 && adduser  -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

ENV NODE_ENV=production

# Corre migraciones e inicia la app en una sola línea (sin script externo)
CMD node ./node_modules/typeorm/cli.js migration:run --dataSource dist/database/data-source.js && node dist/main
