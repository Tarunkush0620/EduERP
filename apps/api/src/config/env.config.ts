import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.API_PORT || '3001', 10),
  prefix: process.env.API_PREFIX || 'api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://eduerp:eduerp_secret@localhost:5432/eduerp',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER || 'eduerp',
  password: process.env.DATABASE_PASSWORD || 'eduerp_secret',
  name: process.env.DATABASE_NAME || 'eduerp',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));

export const redisConfig = registerAs('redis', () => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
}));
