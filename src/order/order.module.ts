import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './service/order.service';
import { OrderController } from './controller/order.controller';
import { OrderRepository } from './repository/order.repository';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { OrderItemRepository } from './repository/order-item.repository';
import { TransactionModule } from 'src/transaction/transaction.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Transaction } from 'typeorm';
import { TransactionDetail } from 'src/transaction/entities/transaction-detail.entity';
import { UserModule } from 'src/user/user.module';
import { ProductModule } from 'src/product/product.module';
import { ProductRepository } from 'src/product/repository/product.repository';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    // TransactionModule.forFeature([Transaction, TransactionDetail]),
    // forwardRef(() => UserModule),
    // forwardRef(() => ProductModule),
    // forwardRef(() => CategoryModule),
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION_TIME') },
      }),
    }),
    forwardRef(() => TransactionModule),
    forwardRef(() => ProductModule),
    forwardRef(() => UserModule),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    TransactionService,
    OrderItemRepository,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    OrderService,
    OrderRepository,
    TransactionService,
    OrderItemRepository,
    TypeOrmModule,
  ],
})
export class OrderModule {}
