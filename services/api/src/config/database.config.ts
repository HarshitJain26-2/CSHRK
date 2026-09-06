import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as entities from '../database/entities';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'cshrk_db',
  entities: Object.values(entities),
  synchronize: process.env.NODE_ENV === 'development', // Auto sync schema in development
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
