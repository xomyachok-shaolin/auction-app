# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

# Устанавливаем зависимости клиента и собираем приложение
RUN cd client && pnpm install && pnpm run build

# Устанавливаем переменную окружения для порта
ENV PORT=5000

# Expose the port your backend listens on
EXPOSE 5000

# Start the backend server
CMD ["node", "server.js"]
