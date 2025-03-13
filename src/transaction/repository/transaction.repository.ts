import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Repository, Between, FindOptionsWhere, DataSource } from 'typeorm';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { PaginationParams } from 'src/utils/pagination.interface';
import { TransactionService } from '../service/transaction.service';

@Injectable()
export class TransactionRepository extends Repository<Transaction> {
  constructor(private dataSource: DataSource) {
    super(Transaction, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Transaction> {
    return this.findOne({
      where: { id },
      relations: ['user', 'order', 'details'],
    });
  }

  async findByTransactionNumber(
    transactionNumber: string,
  ): Promise<Transaction> {
    return this.findOne({
      where: { transactionNumber },
      relations: ['user', 'order', 'details'],
    });
  }

  async findByOrderId(orderId: number): Promise<Transaction[]> {
    return this.find({
      where: { orderId },
      relations: ['details'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIdWithPagination(
    userId: number,
    { page = 1, limit = 10 }: PaginationParams,
    type?: TransactionType,
  ): Promise<[Transaction[], number]> {
    const whereClause: FindOptionsWhere<Transaction> = { userId };

    if (type) {
      whereClause.type = type;
    }

    return this.findAndCount({
      where: whereClause,
      relations: ['order'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getTransactionStats(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate && endDate) {
        whereClause.createdAt = Between(startDate, endDate);
      } else if (startDate) {
        whereClause.createdAt = Between(startDate, new Date());
      }
    }

    // Stats by type and status using raw query for aggregation
    const stats = await this.createQueryBuilder('transaction')
      .select('transaction.type', 'type')
      .addSelect('transaction.status', 'status')
      .addSelect('COUNT(transaction.id)', 'count')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .where(whereClause)
      .groupBy('transaction.type')
      .addGroupBy('transaction.status')
      .getRawMany();

    // Get overall totals
    const totals = await this.createQueryBuilder('transaction')
      .select('COUNT(transaction.id)', 'totalTransactions')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .addSelect('SUM(transaction.pointsEarned)', 'totalPointsEarned')
      .where({
        ...whereClause,
        status: 'completed',
      })
      .getRawOne();

    return {
      byTypeAndStatus: stats,
      totals,
    };
  }

  async createTransaction(
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    const transaction = this.create(transactionData);
    return this.save(transaction);
  }

  async updateTransaction(
    id: number,
    data: Partial<Transaction>,
  ): Promise<Transaction> {
    await this.update(id, data);
    return this.findById(id);
  }
}
