// src/entities/transaction-detail.entity.ts
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('transaction_details')
export class TransactionDetail {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  @Index('idx_transaction_detail_transaction')
  transactionId: number;

  @Column()
  @Index('idx_transaction_detail_key')
  key: string;

  @Column('text')
  value: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Transaction, (transaction) => transaction.details)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;
}
