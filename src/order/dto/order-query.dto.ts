import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class OrderQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: OrderStatus;
}
