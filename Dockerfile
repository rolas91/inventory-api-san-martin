# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Elimina devDependencies
RUN npm prune --omit=dev

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Crea usuario no-root antes de copiar archivos
RUN apk add --no-cache tzdata \
 && addgroup -S appgroup \
 && adduser  -S appuser -G appgroup

WORKDIR /app

# Copia archivos como root, luego cambia permisos
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY docker-entrypoint.sh             ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
 && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

ENV NODE_ENV=production

ENTRYPOINT ["./docker-entrypoint.sh"]
