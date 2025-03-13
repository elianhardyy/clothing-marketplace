// src/order/entities/order.entity.ts
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { v4 as uuidv4 } from 'uuid';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  @Index('idx_order_user')
  userId: number;

  @Column({ unique: true })
  @Index('idx_order_number')
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  @Index('idx_order_status')
  status: OrderStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalAmount: number;

  @Column()
  shippingAddress: string;

  @Column()
  shippingCity: string;

  @Column()
  shippingState: string;

  @Column()
  shippingZip: string;

  @Column()
  shippingCountry: string;

  @Column()
  paymentMethod: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  shippingPrice: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  paidAt: Date;

  @Column({ default: false })
  isDelivered: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deliveredAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[];

  @OneToMany(() => Transaction, (transaction) => transaction.order)
  transactions: Transaction[];

  @BeforeInsert()
  generateOrderNumber() {
    if (!this.orderNumber) {
      this.orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;
    }
  }
}
