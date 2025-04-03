import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/product/entities/category.entity';
import { SeedService } from '../services/category.service.seed';
import { CategorySeeder } from './category.seed';
import { RoleSeeder } from './role.seed';
import { Role } from 'src/user/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Role])],
  providers: [SeedService, CategorySeeder, RoleSeeder],
  exports: [SeedService],
})
export class SeedModule {}
