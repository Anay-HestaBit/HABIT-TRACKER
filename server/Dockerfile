# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies separately for better caching
COPY package*.json ./
RUN npm install

# Copy source and build (if there were a build step, but this is a Node server)
COPY . .

# Final stage
FROM node:20-alpine

# Set to production
ENV NODE_ENV=production

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Security: Run as non-root user
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup || true

# Copy built/source files
COPY --from=builder /app ./

# Create uploads directory and set permissions
RUN mkdir -p public/uploads && chown -R nodeuser:nodegroup public/uploads

USER nodeuser

EXPOSE 5000

# Using tini or similar or just node
CMD ["node", "server.js"]
