# --- Этап 1: Сборщик (Builder) ---
# Используем образ Node.js для установки зависимостей и сборки проекта
FROM node:20 AS builder

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости
RUN npm install

# Копируем все остальные файлы проекта
COPY . .

# Генерируем миграции ВНУТРИ контейнера.
RUN npm run db:generate

# Запускаем команду сборки из package.json
# Эта команда теперь также компилирует migrate.ts в dist/migrate.js
RUN npm run build


# --- Этап 2: Исполнитель (Runner) ---
# Используем более легкий и безопасный образ для запуска приложения
FROM node:20-alpine

WORKDIR /app

# Копируем package.json и package-lock.json снова
COPY package*.json ./

# Устанавливаем ТОЛЬКО производственные зависимости
RUN npm install --omit=dev

# Копируем собранные файлы из этапа "Сборщик"
COPY --from=builder /app/dist ./dist

# Копируем папку с миграциями
COPY --from=builder /app/drizzle ./drizzle

# Открываем порт 3000, на котором будет работать сервер
EXPOSE 3000

# ВАЖНО: Команда для запуска. Сначала применяет миграции, потом запускает сервер.
# Теперь она будет работать, так как вызовет `node dist/migrate.js`
CMD ["sh", "-c", "npm run db:migrate && npm run start"]