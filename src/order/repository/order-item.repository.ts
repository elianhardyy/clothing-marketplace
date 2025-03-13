// src/order/repositories/order-item.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';

@Injectable()
export class OrderItemRepository {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async findByOrderId(orderId: number): Promise<OrderItem[]> {
    return this.orderItemRepository.find({
      where: { orderId },
      relations: ['product'],
    });
  }

  async create(orderItemData: Partial<OrderItem>): Promise<OrderItem> {
    const orderItem = this.orderItemRepository.create(orderItemData);
    return this.orderItemRepository.save(orderItem);
  }

  async save(orderItem: OrderItem): Promise<OrderItem> {
    return this.orderItemRepository.save(orderItem);
  }

  async bulkCreate(orderItems: Partial<OrderItem>[]): Promise<OrderItem[]> {
    const items = this.orderItemRepository.create(orderItems);
    return this.orderItemRepository.save(items);
  }
}
