# Используем Node.js в качестве базового образа
FROM node:20

# Устанавливаем pnpm
RUN npm install -g pnpm

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Устанавливаем зависимости сервера и клиента
RUN pnpm install

# Копируем весь код в контейнер
COPY . .

# Собираем React-приложение
RUN pnpm run build --filter client

# Устанавливаем переменную окружения для порта
ENV PORT=5000

# Открываем порт
EXPOSE 5000

# Запускаем приложение
CMD ["node", "server.js"]
