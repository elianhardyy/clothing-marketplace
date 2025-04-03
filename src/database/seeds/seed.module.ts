import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/product/entities/category.entity';
import { SeedService } from './services/category.service.seed';
import { CategorySeeder } from './category.seed';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [SeedService, CategorySeeder],
  exports: [SeedService],
})
export class SeedModule {}
