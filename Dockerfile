FROM node:20-alpine

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

# Create data directory
RUN mkdir -p data

# Apply TypeScript fixes
# Copy the fixed files
COPY ./src/commands/pluralkit/member.ts ./src/commands/pluralkit/member.ts
COPY ./src/commands/pluralkit/system.ts ./src/commands/pluralkit/system.ts
COPY ./src/commands/pluralkit/switch.ts ./src/commands/pluralkit/switch.ts

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on (if your bot uses HTTP)
# EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
