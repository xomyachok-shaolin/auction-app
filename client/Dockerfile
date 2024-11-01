# Frontend Dockerfile
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY client/package.json client/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the frontend code and build it
COPY client/ .
RUN pnpm run build

# Serve the frontend using NGINX
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
