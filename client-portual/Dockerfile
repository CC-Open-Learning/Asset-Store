FROM node:23.3.0-bookworm-slim AS build

#Working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies (the packages.json right now has production dependencies in the devdependencies, this way we will just do npm install for now)
RUN npm install --omit=dev

# Install all dependencies (ideally we should use the above command)
# RUN npm install

# Copy the rest of the files
COPY . .

# Set environment variables
ENV VITE_SERVER_BASE_URL=https://assetstore.vconestoga.com
ENV VITE_SERVER_URL=https://assetstore.vconestoga.com/api

# Build the app
RUN npm run build

# Use nginx to serve the app
FROM nginx:1.24.0-alpine

# Copy the build files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the nginx configuration (a React application (or any SPA—Single Page Application), routes like /login don't exist as physical files. Instead, they should all be handled by the index.html, and the React Router takes over the routing within the application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port
EXPOSE 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]