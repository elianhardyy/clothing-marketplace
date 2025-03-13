import {
  TransactionStatus,
  TransactionType,
} from 'src/transaction/entities/transaction.entity';

export class TransactionResponseDto {
  id: number;
  transactionNumber: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  paymentMethod: string;
  currency: string;
  pointsEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionDetailResponseDto {
  id: number;
  key: string;
  value: string;
}

export class TransactionWithDetailsResponseDto extends TransactionResponseDto {
  details: TransactionDetailResponseDto[];
}
