import { Module } from '@nestjs/common';
import { OrderService } from './service/order.service';
import { OrderController } from './controller/order.controller';
import { OrderRepository } from './repository/order.repository';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { OrderItemRepository } from './repository/order-item.repository';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    TransactionService,
    OrderItemRepository,
  ],
  exports: [
    OrderService,
    OrderRepository,
    TransactionService,
    OrderItemRepository,
  ],
})
export class OrderModule {}
