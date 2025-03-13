export class CategoryResponseDto {
  id: number;
  name: string;
}

export class ProductResponseDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: number;
  category?: CategoryResponseDto;
  sizes: string[];
  colors: string[];
  brand: string;
  featured: boolean;
  ratings: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductListResponseDto {
  products: ProductResponseDto[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export class FeaturedProductsResponseDto {
  products: ProductResponseDto[];
}
