# Use Node.js LTS as the base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine for understanding why libc6-compat is needed
RUN apk add --no-cache libc6-compat

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all files
COPY . .

# Make sure .env.example is included
COPY .env.example .env.example

# Set environment variables for better performance
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Update next.config.mjs to enable standalone output
RUN sed -i 's/const nextConfig = {/const nextConfig = {\n  output: "standalone",/' next.config.mjs

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set proper headers for WebContainer compatibility
RUN echo '{"headers":[{"source":"/(.*)","headers":[{"key":"Cross-Origin-Opener-Policy","value":"same-origin"},{"key":"Cross-Origin-Embedder-Policy","value":"require-corp"}]}]}' > ./headers.json

# Switch to non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Set the command to run the app
CMD ["node", "server.js"]