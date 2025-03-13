import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

import {
  TransactionStatus,
  TransactionType,
} from 'src/transaction/entities/transaction.entity';
import { PaginationParams } from 'src/utils/pagination.interface';

export class CreatePaymentTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsOptional()
  paymentDetails?: Record<string, string>;
}

export class CreateRefundTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @IsOptional()
  originalTransactionId?: number;
}

export class UpdateTransactionStatusDto {
  @IsEnum(['completed', 'failed', 'cancelled'])
  @IsNotEmpty()
  status: TransactionStatus;

  @IsString()
  @IsOptional()
  externalReference?: string;
}

export class TransactionQueryDto implements PaginationParams {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsEnum(['payment', 'refund', 'payout'])
  type?: TransactionType;
}

export class TransactionStatsDto {
  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;
}
