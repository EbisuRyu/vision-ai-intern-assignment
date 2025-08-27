# Development Dockerfile for Next.js
FROM node:18-alpine

WORKDIR /app

# Dev environment and better file-watching in containers (Windows/macOS)
ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1 \
    CHOKIDAR_USEPOLLING=1 \
    WATCHPACK_POLLING=true \
    PORT=3000

# Only install dependencies; source code will be mounted via volume in docker-compose
COPY package.json package-lock.json* ./
RUN npm ci

# Copy entire source code into the image for self-contained dev runs
COPY . .

EXPOSE 3000

# Start Next.js in dev mode, bind to all interfaces
CMD ["npm", "run", "dev", "--", "-p", "3000", "-H", "0.0.0.0"]