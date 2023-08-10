FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Define build args
ARG DATABASE_URL
ARG COMPUTER_VISION_KEY
ARG COMPUTER_VISION_ENDPOINT
ARG MY_STORAGE_ACCOUNT_NAME
ARG STORAGE_ACCOUNT_KEY

# Set environment variables
ENV AZURE_DATABASE_URL=$DATABASE_URL
ENV AZURE_COMPUTER_VISION_KEY=$COMPUTER_VISION_KEY
ENV AZURE_COMPUTER_VISION_ENDPOINT=$COMPUTER_VISION_ENDPOINT
ENV AZURE_STORAGE_ACCOUNT_NAME=$MY_STORAGE_ACCOUNT_NAME
ENV AZURE_STORAGE_ACCOUNT_KEY=$STORAGE_ACCOUNT_KEY

# Copy entrypoint script and prisma schema
COPY prisma prisma
COPY entrypoint.sh ./

# Grant execute permission on entrypoint script
RUN chmod +x ./entrypoint.sh

# Entrypoint script needs prisma
RUN npm i -g prisma

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME localhost

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]