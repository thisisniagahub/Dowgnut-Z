import { Module, Global, DynamicModule } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Global()
@Module({})
export class PrismaModule {
  static forRoot(): DynamicModule {
    return {
      module: PrismaModule,
      providers: [
        {
          provide: 'PRISMA_CLIENT',
          useFactory: () => {
            const prisma = new PrismaClient({
              log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            });
            return prisma;
          },
        },
      ],
      exports: ['PRISMA_CLIENT'],
    };
  }
}