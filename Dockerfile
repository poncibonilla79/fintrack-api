# ── ETAPA 1: BUILDER (compilar TypeScript) ──────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Generar Prisma Client
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
COPY prisma.config.ts ./

# Compilar TypeScript
RUN npm run build

# Eliminar devDependencies para imagen final más liviana
RUN npm prune --omit=dev

# ── ETAPA 2: RUNNER (imagen final mínima) ──────────────
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["dumb-init", "sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
