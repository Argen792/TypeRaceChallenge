import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  dialect: 'postgresql',
  schema: './shared/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // Используем настоящий URL, если он есть, или "пустышку", если его нет (во время сборки)
    url: process.env.DATABASE_URL || 'postgresql://dummy:dummy@dummy:5432/dummy',
  },
});