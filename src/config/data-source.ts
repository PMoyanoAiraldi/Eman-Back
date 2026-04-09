import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';

dotenv.config({ path: '.env' });

console.log({
  DB_NAME: process.env.DB_NAME,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
});

const PostgresDataSource: DataSourceOptions = {
  type: 'postgres',
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10), // valor por defecto
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  //url: process.env.DB_URL,
  ssl: false,
  // ssl: {
  // rejectUnauthorized: false,
  // },
  //dropSchema: true,
  synchronize: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: ['./dist/migration/*{.ts,.js}'],
};

export const postgresDataSourceConfig = registerAs(
  'postgres',
  () => PostgresDataSource,
);

export const connectionSource = new DataSource(PostgresDataSource);
