import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://eduerp:eduerp_secret@localhost:5432/eduerp',
  },
  verbose: true,
  strict: true,
});
