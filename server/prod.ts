// server/prod.ts
import express from 'express';
import { registerRoutes } from './routes';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // API-маршруты регистрируются в первую очередь
  await registerRoutes(app);

  // --- ИСПРАВЛЕННАЯ РАЗДАЧА СТАТИЧЕСКИХ ФАЙЛОВ ---
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // В Docker-контейнере наш скрипт запускается из /app/dist,
  // а фронтенд собран в /app/dist/public.
  // Поэтому правильный путь к статике - это 'public' относительно текущей директории.
  const publicPath = path.join(__dirname, 'public');

  // Раздаем статические ассеты (js, css, картинки)
  app.use(express.static(publicPath));

  // Для любого другого запроса, который не является API, отдаем главный index.html
  // Это нужно для работы роутинга на стороне клиента (SPA).
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
  // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

  app.listen(port, () => {
    console.log(`Production server is running on http://localhost:${port}`);
  });
}

startServer();