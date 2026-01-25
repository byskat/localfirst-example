# Dockerfile for TanStack Start app
FROM node:22-alpine AS base

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate

# Build stage
FROM base AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

RUN pnpm build

# Production stage
FROM base AS runner

WORKDIR /app

# Install curl for healthchecks
RUN apk add --no-cache curl wget

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built app and necessary files
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/src/db/out ./src/db/out
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000 || exit 1

# Start the app
CMD ["node", ".output/server/index.mjs"]
