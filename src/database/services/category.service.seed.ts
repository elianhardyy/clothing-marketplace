import { Injectable } from '@nestjs/common';
import { CategorySeeder } from '../seeds/category.seed';
import { RoleSeeder } from '../seeds/role.seed';

@Injectable()
export class SeedService {
  constructor(
    private readonly categorySeeder: CategorySeeder,
    private readonly roleSeeder: RoleSeeder,
  ) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    try {
      // Seed categories
      await this.roleSeeder.seed();
      await this.categorySeeder.seed();
      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}
