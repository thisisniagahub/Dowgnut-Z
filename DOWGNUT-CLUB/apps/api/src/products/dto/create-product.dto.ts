export class CreateProductDto {
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  imageUrl?: string;
  images?: string;
  tags?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}