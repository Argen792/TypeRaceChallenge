import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

async function runMigrations() {
  console.log('Running database migrations...');
  let migrationClient;
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set in your environment variables.");
    }
    // Создаем новый клиент специально для миграций
    migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
    const db = drizzle(migrationClient);

    await migrate(db, { migrationsFolder: './drizzle' });

    console.log('Migrations completed successfully!');

    // Явно закрываем соединение
    await migrationClient.end();

    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    // Убеждаемся, что соединение закрыто даже в случае ошибки
    if (migrationClient) {
      await migrationClient.end();
    }
    process.exit(1);
  }
}

runMigrations();
