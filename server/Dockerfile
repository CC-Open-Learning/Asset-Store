FROM node:23.3.0-bookworm-slim

# Working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the files
COPY . .

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]