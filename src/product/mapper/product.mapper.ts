// src/product/mapper/product.mapper.ts

import {
  CategoryResponseDto,
  ProductResponseDto,
} from '../dto/response/product-response.dto';
import { Product } from '../entities/product.entity';

export class ProductMapper {
  static toResponseDto(product: Product): ProductResponseDto {
    // Map category if available
    let category: CategoryResponseDto = null;
    if (product.category) {
      category = {
        id: product.category.id,
        name: product.category.name,
      };
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price), // Convert decimal to number
      stock: product.stock,
      images: product.images,
      categoryId: product.categoryId,
      category: category,
      sizes: product.sizes,
      colors: product.colors,
      brand: product.brand,
      featured: product.featured,
      ratings: product.ratings,
      numReviews: product.numReviews,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
