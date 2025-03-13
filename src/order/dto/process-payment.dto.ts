import { IsNotEmpty, IsObject } from 'class-validator';

export class ProcessPaymentDto {
  @IsObject()
  @IsNotEmpty()
  paymentDetails: Record<string, any>;
}
