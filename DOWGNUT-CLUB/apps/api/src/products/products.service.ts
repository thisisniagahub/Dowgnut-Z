import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        categoryId: dto.categoryId,
        basePrice: dto.basePrice,
        imageUrl: dto.imageUrl,
        images: dto.images || '',
        tags: dto.tags || '',
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
      },
    });
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: products, meta: { total: products.length } };
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }
}