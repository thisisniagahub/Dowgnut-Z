import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  const config = new DocumentBuilder()
    .setTitle('DOWGNUT CLUB™ API')
    .setDescription('Viral Commerce API for DOWGNUT CLUB™')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication')
    .addTag('users', 'User management')
    .addTag('products', 'Products & Drops')
    .addTag('orders', 'Orders & Checkout')
    .addTag('wallet', 'Wallet & Rewards')
    .addTag('referrals', 'Referral System')
    .addTag('campaigns', 'Campaigns & Drops')
    .addTag('creators', 'Creator Hub')
    .addTag('partners', 'Partner Counters')
    .addTag('admin', 'Admin Operations')
    .addTag('ai', 'AI Agent')
    .build();

  const document = SwaggerModule.createDocument(app, {
    ...new DocumentBuilder()
      .setTitle('DOWGNUT CLUB™ API')
      .setDescription('Viral Commerce API for DOWGNUT CLUB™')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication')
      .addTag('users', 'User Management')
      .addTag('products', 'Products & Drops')
      .addTag('orders', 'Orders & Checkout')
      .addTag('wallet', 'Wallet & Rewards')
      .addTag('referrals', 'Referral System')
      .addTag('campaigns', 'Campaigns & Drops')
      .addTag('creators', 'Creator Hub')
      .addTag('partners', 'Partner Counters')
      .addTag('admin', 'Admin Operations')
      .addTag('ai', 'AI Agent')
      .build(),
  );

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 DOWGNUT CLUB API running on http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/docs`);
}

bootstrap();