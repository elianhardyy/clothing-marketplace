import { IsDateString, IsOptional, IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class OrderStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: OrderStatus;
}
