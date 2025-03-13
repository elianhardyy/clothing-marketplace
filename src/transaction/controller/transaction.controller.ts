import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { TransactionService } from '../service/transaction.service';
import {
  CreatePaymentTransactionDto,
  CreateRefundTransactionDto,
  UpdateTransactionStatusDto,
  TransactionQueryDto,
  TransactionStatsDto,
} from '../dto/request/transaction-request.dto';
import { ApiResponse } from 'src/utils/api.response';
import { Response } from 'express';

@Controller('api/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('payment')
  async createPaymentTransaction(
    @Body() createDto: CreatePaymentTransactionDto,
    @Res() res: Response,
  ) {
    const transaction =
      await this.transactionService.createPaymentTransaction(createDto);
    return ApiResponse.success(
      res,
      'Payment transaction created successfully',
      transaction,
      HttpStatus.CREATED,
    );
  }

  @Post('refund')
  async createRefundTransaction(
    @Body() createDto: CreateRefundTransactionDto,
    @Res() res: Response,
  ) {
    const transaction =
      await this.transactionService.createRefundTransaction(createDto);
    return ApiResponse.success(
      res,
      'Refund transaction created successfully',
      transaction,
      HttpStatus.CREATED,
    );
  }

  @Patch(':id/status')
  async updateTransactionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTransactionStatusDto,
    @Res() res: Response,
  ) {
    const transaction = await this.transactionService.updateTransactionStatus(
      id,
      updateDto,
    );
    return ApiResponse.success(
      res,
      'Transaction status updated successfully',
      transaction,
    );
  }

  @Patch(':id/complete-refund')
  async completeRefundTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const transaction =
      await this.transactionService.completeRefundTransaction(id);
    return ApiResponse.success(
      res,
      'Refund transaction completed successfully',
      transaction,
    );
  }

  @Get(':id')
  async getTransactionById(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const transaction = await this.transactionService.getTransactionById(id);
    return ApiResponse.success(
      res,
      'Transaction retrieved successfully',
      transaction,
    );
  }

  @Get('order/:orderId')
  async getOrderTransactions(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Res() res: Response,
  ) {
    const transactions =
      await this.transactionService.getOrderTransactions(orderId);
    return ApiResponse.success(
      res,
      'Order transactions retrieved successfully',
      transactions,
    );
  }

  @Get('user/:userId')
  async getUserTransactions(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() queryDto: TransactionQueryDto,
    @Res() res: Response,
  ) {
    const result = await this.transactionService.getUserTransactions(
      userId,
      queryDto,
    );
    return ApiResponse.success(
      res,
      'User transactions retrieved successfully',
      result.transactions,
      HttpStatus.OK,
      result.pagination,
    );
  }

  @Get('stats')
  async getTransactionStats(
    @Query() statsDto: TransactionStatsDto,
    @Res() res: Response,
  ) {
    const stats = await this.transactionService.getTransactionStats(statsDto);
    return ApiResponse.success(
      res,
      'Transaction statistics retrieved successfully',
      stats,
    );
  }
}
