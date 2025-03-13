import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { TransactionModule } from './transaction/transaction.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user/entities/user.entity';
import { Role } from './user/entities/role.entity';
import { UserRole } from './user/entities/user-role.entity';
import { Category } from './product/entities/category.entity';
import { Product } from './product/entities/product.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { Transaction } from './transaction/entities/transaction.entity';
import { TransactionDetail } from './transaction/entities/transaction-detail.entity';

@Module({
  imports: [
    ProductModule,
    UserModule,
    OrderModule,
    TransactionModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (env: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'clothing_marketplace2',
        entities: [
          Role,
          User,
          UserRole,
          Category,
          Product,
          Order,
          OrderItem,
          Transaction,
          TransactionDetail,
        ],
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
