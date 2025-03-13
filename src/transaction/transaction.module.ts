import { forwardRef, Module } from '@nestjs/common';
import { TransactionService } from './service/transaction.service';
import { TransactionController } from './controller/transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'typeorm';
import { TransactionDetail } from './entities/transaction-detail.entity';
import { User } from 'src/user/entities/user.entity';
import { Order } from 'src/order/entities/order.entity';
import { TransactionRepository } from './repository/transaction.repository';
import { TransactionDetailRepository } from './repository/transaction-detail.repository';
import { OrderModule } from 'src/order/order.module';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order]),
    forwardRef(() => OrderModule),
    forwardRef(() => ProductModule),
    forwardRef(() => UserModule),
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionRepository,
    TransactionDetailRepository,
  ],
  exports: [
    TransactionService,
    TransactionRepository,
    TransactionDetailRepository,
  ],
})
export class TransactionModule {}
