// server/index.ts (теперь только для разработки)
import express from 'express';
import { registerRoutes } from './routes';
import { honoMiddleware as viteMiddleware } from './vite';
import 'dotenv/config';

async function createDevServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Middleware для парсинга JSON
  app.use(express.json());

  // Регистрируем API-маршруты
  await registerRoutes(app);

  // Middleware для разработки от Vite
  app.use(viteMiddleware);

  app.listen(port, () => {
    console.log(`Development server is running on http://localhost:${port}`);
  });
}

createDevServer();