# Nuxt Fullstack MCP - Production Docker Image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.14.0

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/nuxt-mcp/package.json ./packages/nuxt-mcp/
COPY packages/vite-plugin-mcp/package.json ./packages/vite-plugin-mcp/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.14.0

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/nuxt-mcp/node_modules ./packages/nuxt-mcp/node_modules
COPY --from=deps /app/packages/vite-plugin-mcp/node_modules ./packages/vite-plugin-mcp/node_modules

# Copy source code
COPY . .

# Build the packages
RUN pnpm build

# Production image, copy all the files and run the application
FROM base AS runner
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.14.0

ENV NODE_ENV=production

# Create nuxt user
RUN addgroup --system --gid 1001 nuxt
RUN adduser --system --uid 1001 nuxt

# Copy built application
COPY --from=builder --chown=nuxt:nuxt /app/dist ./dist
COPY --from=builder --chown=nuxt:nuxt /app/packages ./packages
COPY --from=builder --chown=nuxt:nuxt /app/package.json ./package.json
COPY --from=builder --chown=nuxt:nuxt /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=nuxt:nuxt /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

USER nuxt

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["pnpm", "start"]