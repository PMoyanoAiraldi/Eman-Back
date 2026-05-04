import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  
  app.enableCors({
    origin: 'http://localhost:5173', // URL de tu frontend
    credentials: true, //  Imprescindible para que las cookies viajen
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true, // Evita validar propiedades no enviadas
      skipUndefinedProperties: true, // Ignora campos que no están definidos
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Mi API')
    .setDescription('Documentación del ecommerce')
    .setVersion('1.0')
    .addTag('api')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3010);
}
bootstrap();
