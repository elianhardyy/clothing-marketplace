// src/entities/product.entity.ts
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { OrderItem } from 'src/order/entities/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
  })
  stock: number;

  @Column('simple-json')
  images: string[];

  @Column({ unsigned: true })
  @Index('products_category')
  categoryId: number;

  @Column({
    type: 'simple-json',
    nullable: true,
    default: '[]',
  })
  sizes: string[];

  @Column({
    type: 'simple-json',
    nullable: true,
    default: '[]',
  })
  colors: string[];

  @Column({ length: 50 })
  brand: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'float', default: 0 })
  ratings: number;

  @Column({ type: 'int', default: 0 })
  numReviews: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
