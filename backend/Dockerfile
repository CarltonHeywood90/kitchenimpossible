# Use Node.js LTS
FROM node:20

WORKDIR /app

# Copy package files if you have them, otherwise just copy everything
COPY . .

# Install dependencies if package.json exists
RUN if [ -f package.json ]; then npm install; fi

# Expose port 4000
EXPOSE 4000

# Start server
CMD ["node", "server.js"]
