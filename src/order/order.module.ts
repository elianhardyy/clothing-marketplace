import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './service/order.service';
import { OrderController } from './controller/order.controller';
import { OrderRepository } from './repository/order.repository';
import { OrderItemRepository } from './repository/order-item.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { TransactionModule } from 'src/transaction/transaction.module';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';
import { TransactionService } from 'src/transaction/service/transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION_TIME') },
      }),
    }),
    forwardRef(() => ProductModule),
    forwardRef(() => UserModule),
    forwardRef(() => TransactionModule),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    OrderItemRepository,
    TransactionService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    OrderService,
    OrderRepository,
    OrderItemRepository,
    TransactionService,
    TypeOrmModule,
  ],
})
export class OrderModule {}
