import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { postgresDataSourceConfig } from './config/data-source';
import { DataSourceOptions } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ postgresDataSourceConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory:  (configService: ConfigService): DataSourceOptions => {
        const config = configService.get<DataSourceOptions>('postgres');
        if (!config) throw new Error('Postgres config not found');
        return config;
      }
    }),
    BrandsModule,
    CategoriesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
