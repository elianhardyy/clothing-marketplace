import { Injectable } from '@nestjs/common';
import { CategorySeeder } from '../category.seed';

@Injectable()
export class SeedService {
  constructor(private readonly categorySeeder: CategorySeeder) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    try {
      // Seed categories
      await this.categorySeeder.seed();

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}
