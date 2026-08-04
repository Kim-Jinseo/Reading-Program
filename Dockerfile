FROM node:20-alpine
WORKDIR /app

# Copy the backend package.json and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY backend/ ./

# Start the Node.js server
CMD ["npm", "start"]
