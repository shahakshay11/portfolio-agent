# Use the official Playwright Docker image which has everything pre-installed
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Copy package files first for better Docker caching
COPY package*.json ./

# Install npm dependencies
RUN npm ci --only=production

# Verify Playwright installation
RUN npx playwright --version
RUN ls -la /ms-playwright/chromium-*/ || echo "Browser path check failed"

# Set Playwright browsers path (required for the official image)
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Copy application code
COPY . .

# Create reports directory
RUN mkdir -p /app/reports

# Expose port
EXPOSE 10000

# Set environment variables
ENV NODE_ENV=production
ENV RENDER=true

# Start the application
CMD ["npm", "start"]