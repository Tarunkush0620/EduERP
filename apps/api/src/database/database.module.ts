import { Module, Global } from '@nestjs/common';
import { getDb, getPool } from './database';

export const DATABASE_TOKEN = 'DATABASE_CONNECTION';
export const POOL_TOKEN = 'DATABASE_POOL';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory: () => getDb(),
    },
    {
      provide: POOL_TOKEN,
      useFactory: () => getPool(),
    },
  ],
  exports: [DATABASE_TOKEN, POOL_TOKEN],
})
export class DatabaseModule {}
