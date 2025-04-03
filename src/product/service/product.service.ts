// src/product/product.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepository } from '../repository/product.repository';
import { Category } from '../entities/category.entity';
import {
  CreateProductRequestDto,
  ProductFilterRequestDto,
  UpdateProductRequestDto,
} from '../dto/request/product-request.dto';
import {
  FeaturedProductsResponseDto,
  ProductListResponseDto,
  ProductResponseDto,
} from '../dto/response/product-response.dto';
import { Product } from '../entities/product.entity';
import { ProductMapper } from '../mapper/product.mapper';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async createProduct(
    dto: CreateProductRequestDto,
  ): Promise<ProductResponseDto> {
    // Check if category exists
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if product with same name exists
    const existingProduct = await this.productRepository.findByName(dto.name);
    if (existingProduct) {
      throw new ConflictException('Product with this name already exists');
    }

    // Create product
    const product = new Product();
    Object.assign(product, {
      ...dto,
      stock: dto.stock || 0,
      images: dto.images || [],
      sizes: dto.sizes || [],
      colors: dto.colors || [],
      featured: dto.featured || false,
      ratings: 0,
      numReviews: 0,
    });

    const savedProduct = await this.productRepository.save(product);

    // Fetch product with category relation
    const productWithRelations = await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['category'],
    });

    return ProductMapper.toResponseDto(productWithRelations);
  }

  async updateProduct(
    id: number,
    dto: UpdateProductRequestDto,
  ): Promise<ProductResponseDto> {
    // Find product
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // If changing categoryId, verify category exists
    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Update product
    Object.assign(product, dto);

    const updatedProduct = await this.productRepository.save(product);

    // Refresh product with relations
    const refreshedProduct = await this.productRepository.findOne({
      where: { id: updatedProduct.id },
      relations: ['category'],
    });

    return ProductMapper.toResponseDto(refreshedProduct);
  }

  async getProductById(id: number): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return ProductMapper.toResponseDto(product);
  }

  async getAllProducts(
    filterDto: ProductFilterRequestDto,
  ): Promise<ProductListResponseDto> {
    const [products, totalCount] =
      await this.productRepository.findWithFilters(filterDto);

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;

    return {
      products: products.map((product) => ProductMapper.toResponseDto(product)),
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async getFeaturedProducts(
    limit: number = 10,
  ): Promise<FeaturedProductsResponseDto> {
    const products = await this.productRepository.findFeatured(limit);

    return {
      products: products.map((product) => ProductMapper.toResponseDto(product)),
    };
  }

  async deleteProduct(id: number): Promise<{ success: boolean }> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.remove(product);

    return { success: true };
  }

  async updateProductTransaction(id: number, updates: any): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, updates);
    return this.productRepository.save(product);
  }
}
