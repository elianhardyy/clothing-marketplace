// src/order/repositories/order.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { PaginationParams } from 'src/utils/pagination.interface';

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(private dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Order> {
    return this.findOne({
      where: { id },
      relations: ['user', 'orderItems', 'orderItems.product', 'transactions'],
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    return this.findOne({
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

    const [orders, total] = await this.findAndCount({
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

    const [orders, total] = await this.findAndCount({
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

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = this.create(orderData);
    return this.save(order);
  }

  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order> {
    await this.update(id, orderData);
    return this.findById(id);
  }

  async saveOrder(order: Order): Promise<Order> {
    return this.save(order);
  }

  async getOrderStats(startDate?: Date, endDate?: Date, status?: OrderStatus) {
    const queryBuilder = this.createQueryBuilder('order');

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
    const statusCounts = await this.createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.totalAmount)', 'totalAmount')
      .where(queryBuilder.getQuery().replace(/^WHERE /, ''))
      .setParameters(queryBuilder.getParameters())
      .groupBy('order.status')
      .getRawMany();

    // Get total orders and revenue
    const totalStats = await this.createQueryBuilder('order')
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
