FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install Python (needed for the run-bot.py script)
RUN apk add --update python3

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Create data directory
RUN mkdir -p data

# Expose the port the app runs on (if your bot uses HTTP)
# EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
