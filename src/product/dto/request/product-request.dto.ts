export class CreateProductRequestDto {
  name: string;
  description: string;
  price: number;
  stock?: number;
  images?: string[];
  categoryId: number;
  sizes?: string[];
  colors?: string[];
  brand: string;
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
