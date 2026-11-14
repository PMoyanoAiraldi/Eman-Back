import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';

dotenv.config({ path: '.env' });

const PostgresDataSource: DataSourceOptions = {
  type: 'postgres',
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10), // valor por defecto
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  //url: process.env.DB_URL,
  //ssl: false,
  // ssl: {
  // rejectUnauthorized: false,
  // },

  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  //dropSchema: true,
  synchronize: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
};

export const postgresDataSourceConfig = registerAs(
  'postgres',
  () => PostgresDataSource,
);

export const connectionSource = new DataSource(PostgresDataSource);
