// src/product/product.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { ProductController } from './controller/product.controller';
import { ProductService } from './service/product.service';
import { ProductRepository } from './repository/product.repository';
import { TransactionModule } from 'src/transaction/transaction.module';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
    forwardRef(() => TransactionModule),
    forwardRef(() => OrderModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, JwtStrategy, JwtAuthGuard],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
