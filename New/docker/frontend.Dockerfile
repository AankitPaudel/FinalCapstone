# File: docker/frontend.Dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY frontend/ .

# Build application
RUN npm run build

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3001"]
