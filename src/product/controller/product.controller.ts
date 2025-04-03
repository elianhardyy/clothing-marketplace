import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ProductService } from '../service/product.service';
import {
  CreateProductRequestDto,
  ProductFilterRequestDto,
  UpdateProductRequestDto,
} from '../dto/request/product-request.dto';
import { ApiResponse } from 'src/utils/api.response';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserType } from 'src/user/enums/user-type.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(UserType.MERCHANT, UserType.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Body() dto: CreateProductRequestDto,
    @Res() res: Response,
  ) {
    const product = await this.productService.createProduct(dto);
    return ApiResponse.success(
      res,
      'Product created successfully',
      product,
      HttpStatus.CREATED,
    );
  }

  @Get()
  async getAllProducts(
    @Query() filterDto: ProductFilterRequestDto,
    @Res() res: Response,
  ) {
    const products = await this.productService.getAllProducts(filterDto);

    // Assuming products contains pagination info
    const pagination = products.pagination
      ? {
          totalItems: products.pagination.totalItems,
          totalPages: products.pagination.totalPages,
          currentPage: products.pagination.currentPage,
          itemsPerPage: products.pagination.itemsPerPage,
        }
      : undefined;

    return ApiResponse.success(
      res,
      'Products retrieved successfully',
      products.products,
      HttpStatus.OK,
      pagination,
    );
  }

  @Get('featured')
  async getFeaturedProducts(
    @Res() res: Response,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const featuredProducts =
      await this.productService.getFeaturedProducts(limit);
    return ApiResponse.success(
      res,
      'Featured products retrieved successfully',
      featuredProducts,
    );
  }

  @Get(':id')
  async getProductById(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      const product = await this.productService.getProductById(id);
      return ApiResponse.success(
        res,
        'Product retrieved successfully',
        product,
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Product not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductRequestDto,
    @Res() res: Response,
  ) {
    try {
      const updatedProduct = await this.productService.updateProduct(id, dto);
      return ApiResponse.success(
        res,
        'Product updated successfully',
        updatedProduct,
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Failed to update product',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      const result = await this.productService.deleteProduct(id);
      return ApiResponse.success(res, 'Product deleted successfully', result);
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || 'Failed to delete product',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
