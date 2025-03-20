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
import { UserRepository } from 'src/user/repository/user.repository';
import { UserService } from 'src/user/service/user.service';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

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
    UserRepository,
    UserService,
    JwtStrategy,
    JwtService,
    JwtAuthGuard,
  ],
  exports: [
    TransactionService,
    TransactionRepository,
    TransactionDetailRepository,
  ],
})
export class TransactionModule {}
