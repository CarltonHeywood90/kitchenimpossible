FROM node:20

WORKDIR /app

# Copy package files first to install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the backend files
COPY . .

EXPOSE 4000
CMD ["node", "server.js"]
