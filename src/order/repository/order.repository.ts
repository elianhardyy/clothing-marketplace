// src/order/repositories/order.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { PaginationParams } from 'src/utils/pagination.interface';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async findById(id: number): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'orderItems', 'orderItems.product', 'transactions'],
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    return this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['user', 'orderItems', 'orderItems.product', 'transactions'],
    });
  }

  async findByUserId(
    userId: number,
    options: PaginationParams & { status?: OrderStatus } = {},
  ) {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;

    const whereClause: FindOptionsWhere<Order> = { userId };
    if (status) {
      whereClause.status = status;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where: whereClause,
      relations: ['orderItems', 'orderItems.product'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      orders,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async findAll(options: PaginationParams & { status?: OrderStatus } = {}) {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;

    const whereClause: FindOptionsWhere<Order> = {};
    if (status) {
      whereClause.status = status;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where: whereClause,
      relations: ['user'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      orders,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(orderData);
    return this.orderRepository.save(order);
  }

  async update(id: number, orderData: Partial<Order>): Promise<Order> {
    await this.orderRepository.update(id, orderData);
    return this.findById(id);
  }

  async save(order: Order): Promise<Order> {
    return this.orderRepository.save(order);
  }

  async getOrderStats(startDate?: Date, endDate?: Date, status?: OrderStatus) {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (startDate || endDate) {
      if (startDate) {
        queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
      }
      if (endDate) {
        queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
      }
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    // Count orders by status
    const statusCounts = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.totalAmount)', 'totalAmount')
      .where(queryBuilder.getQuery().replace(/^WHERE /, ''))
      .setParameters(queryBuilder.getParameters())
      .groupBy('order.status')
      .getRawMany();

    // Get total orders and revenue
    const totalStats = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(order.totalAmount)', 'totalRevenue')
      .where(queryBuilder.getQuery().replace(/^WHERE /, ''))
      .setParameters(queryBuilder.getParameters())
      .getRawOne();

    return {
      byStatus: statusCounts,
      totals: totalStats,
    };
  }
}
