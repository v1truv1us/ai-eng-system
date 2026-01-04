# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine AS builder

# Install Bun globally
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the Astro site
RUN bun run build

# Production stage: Use Nginx to serve static files
FROM nginx:alpine

# Copy built site from builder to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
