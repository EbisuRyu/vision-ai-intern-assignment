# Production Dockerfile for Next.js static export
FROM node:18-alpine

WORKDIR /app

# Set environment variables, nếu không truyền PORT thì dùng 3000
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=${PORT:-3000}

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Build & export static site
RUN npm run build

# Expose port
EXPOSE ${PORT}

# Install simple static server
RUN npm install -g serve

# Start server
CMD ["sh", "-c", "serve -s out -l ${PORT}"]