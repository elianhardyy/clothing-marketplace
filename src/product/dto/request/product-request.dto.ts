import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  @IsNumber({}, { message: 'invalid number' })
  @Min(0, { message: 'Value must be a non-negative number' })
  price: number;
  @IsNotEmpty()
  @IsNumber({}, { message: 'invalid number' })
  @Min(0, { message: 'Value must be a non-negative number' })
  stock?: number;
  images?: string[];
  @IsNotEmpty()
  categoryId: number;
  @IsNotEmpty()
  sizes?: string[];
  @IsNotEmpty()
  colors?: string[];
  @IsNotEmpty()
  brand: string;
  @IsNotEmpty()
  featured?: boolean;
}

export class UpdateProductRequestDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  images?: string[];
  categoryId?: number;
  sizes?: string[];
  colors?: string[];
  brand?: string;
  featured?: boolean;
  ratings?: number;
  numReviews?: number;
}

export class ProductFilterRequestDto {
  page?: number;
  limit?: number;
  categoryId?: number;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
