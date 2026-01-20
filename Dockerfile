# Backend Dockerfile for production deployment
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/ .

# Create .env file from environment variables (for production)
# In production, these should be set in the platform's environment variables
RUN echo "Creating production environment..." && \
    echo "PORT=5000" > .env && \
    echo "NODE_ENV=production" >> .env

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "src/index.js"]

