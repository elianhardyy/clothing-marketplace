// src/entities/transaction.entity.ts
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Order } from 'src/order/entities/order.entity';
import { TransactionDetail } from './transaction-detail.entity';

export type TransactionType = 'payment' | 'refund' | 'payout';
export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unique: true })
  @Index('idx_transaction_number')
  transactionNumber: string;

  @Column({ unsigned: true })
  @Index('idx_transaction_user')
  userId: number;

  @Column({ unsigned: true })
  @Index('idx_transaction_order')
  orderId: number;

  @Column({
    type: 'enum',
    enum: ['payment', 'refund', 'payout'],
  })
  @Index('idx_transaction_type')
  type: TransactionType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column()
  paymentMethod: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  @Index('idx_transaction_status')
  status: TransactionStatus;

  @Column({
    length: 3,
    default: 'USD',
  })
  currency: string;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
  })
  pointsEarned: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  externalReference: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @OneToMany(
    () => TransactionDetail,
    (transactionDetail) => transactionDetail.transaction,
  )
  details: TransactionDetail[];
}
