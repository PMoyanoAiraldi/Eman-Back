import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { postgresDataSourceConfig } from './config/data-source';
import { DataSourceOptions } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SizesModule } from './sizes/sizes.module';
import { ImagesModule } from './images/images.module';
import { InstallmentConfig } from './installmentConfig/installmentConfig.entity';
import { OrderModule } from './order/order.module';
import { OrderDetailModule } from './orderDetail/orderDetail.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { ProductVariantsModule } from './productVariants/productVariants.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seeds/seeds.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { MediaContentModule } from './mediaContent/mediaContent.module';
import { SubCategoriesModule } from './subCategories/subCategories.module';
import { ProductTypesModule } from './productTypes/productTypes.module';
import { ColorsModule } from './colors/colors.module';

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
    CategoriesModule,
    SizesModule,
    ImagesModule,
    InstallmentConfig,
    OrderModule,
    OrderDetailModule,
    PaymentsModule,
    ProductsModule,
    ProductVariantsModule,
    SizesModule,
    UsersModule,
    AuthModule,
    SeedModule,
    FileUploadModule,
    MediaContentModule,
    SubCategoriesModule,
    ProductTypesModule,
    ImagesModule,
    ColorsModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
