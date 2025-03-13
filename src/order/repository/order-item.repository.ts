// src/order/repositories/order-item.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class OrderItemRepository extends Repository<OrderItem> {
  constructor(private dataSource: DataSource) {
    super(OrderItem, dataSource.createEntityManager());
  }

  async findByOrderId(orderId: number): Promise<OrderItem[]> {
    return this.find({
      where: { orderId },
      relations: ['product'],
    });
  }

  async createOrderItem(orderItemData: Partial<OrderItem>): Promise<OrderItem> {
    const orderItem = this.create(orderItemData);
    return this.save(orderItem);
  }

  async saveOrderItem(orderItem: OrderItem): Promise<OrderItem> {
    return this.save(orderItem);
  }

  async bulkCreate(orderItems: Partial<OrderItem>[]): Promise<OrderItem[]> {
    const items = this.create(orderItems);
    return this.save(items);
  }
}
