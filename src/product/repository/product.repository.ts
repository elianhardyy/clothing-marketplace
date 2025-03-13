// src/product/product.repository.ts
import { Injectable } from '@nestjs/common';
import {
  Repository,
  DataSource,
  Like,
  Between,
  FindOptionsWhere,
} from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductFilterRequestDto } from '../dto/request/product-request.dto';

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor(private dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async findByName(name: string): Promise<Product | null> {
    return this.findOne({ where: { name } });
  }

  async findWithFilters(
    filterDto: ProductFilterRequestDto,
  ): Promise<[Product[], number]> {
    const {
      page = 1,
      limit = 10,
      categoryId,
      brand,
      minPrice,
      maxPrice,
      inStock,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: FindOptionsWhere<Product> = {};

    if (categoryId) {
      whereConditions.categoryId = categoryId;
    }

    if (brand) {
      whereConditions.brand = brand;
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      whereConditions.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      whereConditions.price = Between(minPrice, Number.MAX_SAFE_INTEGER);
    } else if (maxPrice !== undefined) {
      whereConditions.price = Between(0, maxPrice);
    }

    if (inStock !== undefined) {
      whereConditions.stock = inStock ? Between(1, Number.MAX_SAFE_INTEGER) : 0;
    }

    if (featured !== undefined) {
      whereConditions.featured = featured;
    }

    // Execute query
    return this.findAndCount({
      where: whereConditions,
      relations: ['category'],
      skip,
      take: limit,
      order: {
        [sortBy]: sortOrder,
      },
    });
  }

  async findFeatured(limit: number = 10): Promise<Product[]> {
    return this.find({
      where: { featured: true },
      relations: ['category'],
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
