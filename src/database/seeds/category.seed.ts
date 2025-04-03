import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/product/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategorySeeder {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async seed() {
    const categories = [
      {
        name: 'Electronics',
        description:
          'Electronic devices and accessories including smartphones, laptops, and gadgets',
      },
      {
        name: 'Clothing',
        description: 'Apparel and fashion items for men, women, and children',
      },
      {
        name: 'Home & Kitchen',
        description:
          'Household items, furniture, and kitchen appliances for modern living',
      },
      {
        name: 'Books',
        description:
          'Books, e-books, and publications across various genres and topics',
      },
      {
        name: 'Sports & Outdoors',
        description: 'Sporting goods, equipment, and outdoor recreation items',
      },
      {
        name: 'Beauty & Personal Care',
        description: 'Cosmetics, skincare, and personal hygiene products',
      },
      {
        name: 'Toys & Games',
        description:
          'Toys, games, and entertainment items for all ages and interests',
      },
      {
        name: 'Automotive',
        description: 'Car parts, accessories, and vehicle maintenance products',
      },
      {
        name: 'Health & Wellness',
        description: 'Vitamins, supplements, and health monitoring devices',
      },
      {
        name: 'Jewelry & Watches',
        description:
          'Fine jewelry, fashion jewelry, and watches for all occasions',
      },
    ];

    for (const categoryData of categories) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: categoryData.name },
      });

      if (!existingCategory) {
        const category = this.categoryRepository.create(categoryData);
        await this.categoryRepository.save(category);
        console.log(`Category "${categoryData.name}" created successfully`);
      } else {
        console.log(`Category "${categoryData.name}" already exists, skipping`);
      }
    }
  }
}
