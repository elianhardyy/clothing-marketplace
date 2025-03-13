import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(['processing', 'shipped', 'delivered', 'cancelled'])
  @IsNotEmpty()
  status: OrderStatus;
}
