import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TransactionDetail } from '../entities/transaction-detail.entity';

@Injectable()
export class TransactionDetailRepository extends Repository<TransactionDetail> {
  constructor(private dataSource: DataSource) {
    super(TransactionDetail, dataSource.createEntityManager());
  }

  async createTransactionDetail(
    transactionId: number,
    key: string,
    value: string,
  ): Promise<TransactionDetail> {
    const detail = this.create({
      transactionId,
      key,
      value,
    });
    return this.save(detail);
  }
}
