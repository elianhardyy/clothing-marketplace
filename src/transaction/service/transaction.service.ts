import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { TransactionRepository } from '../repository/transaction.repository';
import {
  CreatePaymentTransactionDto,
  CreateRefundTransactionDto,
  TransactionQueryDto,
  TransactionStatsDto,
  UpdateTransactionStatusDto,
} from '../dto/request/transaction-request.dto';
import { Transaction } from '../entities/transaction.entity';
import { TransactionDetail } from '../entities/transaction-detail.entity';
import { TransactionDetailRepository } from '../repository/transaction-detail.repository';
import { UserService } from 'src/user/service/user.service';
import { OrderService } from 'src/order/service/order.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly transactionDetailRepository: TransactionDetailRepository,
    private readonly userService: UserService,
    private readonly orderService: OrderService,
  ) {}

  /**
   * Create a new payment transaction
   */
  async createPaymentTransaction(
    createDto: CreatePaymentTransactionDto,
  ): Promise<Transaction> {
    const {
      userId,
      orderId,
      amount,
      paymentMethod,
      paymentDetails = {},
    } = createDto;

    try {
      // Calculate points earned (1 point per $10)
      const pointsEarned = Math.floor(amount / 10);

      // Verify order exists and belongs to user
      const order = await this.orderService.getOrderById(orderId);

      if (!order || order.userId !== userId) {
        throw new BadRequestException(
          'Order not found or does not belong to the user',
        );
      }

      // Generate unique transaction number
      const transactionNumber = `PAY-${Date.now()}-${uuidv4().substring(0, 8)}`;

      // Create transaction record
      const newTransaction = this.transactionRepository.create({
        transactionNumber,
        userId,
        orderId,
        type: 'payment',
        amount,
        paymentMethod,
        status: 'pending', // Initial status
        currency: 'USD', // Default currency
        pointsEarned,
        notes: paymentDetails.notes || 'Payment for order',
        externalReference: paymentDetails.externalReference,
      });

      const savedTransaction =
        await this.transactionRepository.save(newTransaction);

      // Store additional payment details
      const detailsToStore = { ...paymentDetails };
      delete detailsToStore.notes;
      delete detailsToStore.externalReference;

      for (const [key, value] of Object.entries(detailsToStore)) {
        if (value) {
          const detail = this.transactionDetailRepository.create({
            transactionId: savedTransaction.id,
            key,
            value: String(value),
          });
          await this.transactionDetailRepository.save(detail);
        }
      }

      return this.transactionRepository.findById(savedTransaction.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: number,
    updateDto: UpdateTransactionStatusDto,
  ): Promise<Transaction> {
    const { status, externalReference } = updateDto;

    try {
      const transaction =
        await this.transactionRepository.findById(transactionId);

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Record previous status for processing
      const previousStatus = transaction.status;

      // Update transaction status
      transaction.status = status;
      if (externalReference) {
        transaction.externalReference = externalReference;
      }

      await this.transactionRepository.save(transaction);

      // Process status change actions
      if (status === 'completed' && previousStatus !== 'completed') {
        // Order is now paid
        const order = await this.orderService.getOrderById(transaction.orderId);
        order.isPaid = true;
        order.paidAt = new Date();
        await this.orderService.updateOrder(order);

        // Add points to user
        if (transaction.pointsEarned > 0) {
          await this.updateUserPoints(
            transaction.userId,
            transaction.pointsEarned,
          );
        }
      }
      // Handle transaction cancellation after it was previously completed
      else if (
        (status === 'cancelled' || status === 'failed') &&
        previousStatus === 'completed' &&
        transaction.pointsEarned > 0
      ) {
        // Deduct points that were awarded
        await this.updateUserPoints(
          transaction.userId,
          -transaction.pointsEarned,
        );
      }

      return this.transactionRepository.findById(transactionId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a refund transaction
   */
  async createRefundTransaction(
    createDto: CreateRefundTransactionDto,
  ): Promise<Transaction> {
    const { userId, orderId, amount, reason, originalTransactionId } =
      createDto;

    try {
      // Find original transaction
      let originalTransaction: Transaction | null;

      if (originalTransactionId) {
        originalTransaction = await this.transactionRepository.findById(
          originalTransactionId,
        );

        if (!originalTransaction || originalTransaction.orderId !== orderId) {
          throw new BadRequestException('Invalid original transaction');
        }
      } else {
        // Find the payment transaction for this order
        originalTransaction = await this.transactionRepository.findOne({
          where: {
            orderId,
            type: 'payment',
            status: 'completed',
          },
        });
      }

      if (!originalTransaction) {
        throw new BadRequestException(
          'No completed payment transaction found for this order',
        );
      }

      // Ensure refund amount doesn't exceed original payment
      if (amount > originalTransaction.amount) {
        throw new BadRequestException(
          'Refund amount cannot exceed original payment amount',
        );
      }

      // Create unique refund transaction number
      const transactionNumber = `REF-${Date.now()}-${uuidv4().substring(0, 8)}`;

      // Create refund transaction
      const refundTransaction = this.transactionRepository.create({
        transactionNumber,
        userId,
        orderId,
        type: 'refund',
        amount: -amount, // Negative amount for refunds
        paymentMethod: originalTransaction.paymentMethod,
        status: 'pending',
        currency: originalTransaction.currency,
        pointsEarned: 0,
        notes: reason || 'Refund transaction',
        externalReference: originalTransaction.externalReference,
      });

      const savedTransaction =
        await this.transactionRepository.save(refundTransaction);

      // Add refund details
      const originalTransactionDetail = this.transactionDetailRepository.create(
        {
          transactionId: savedTransaction.id,
          key: 'originalTransactionId',
          value: originalTransaction.id.toString(),
        },
      );
      await this.transactionDetailRepository.save(originalTransactionDetail);

      const reasonDetail = this.transactionDetailRepository.create({
        transactionId: savedTransaction.id,
        key: 'reason',
        value: reason,
      });
      await this.transactionDetailRepository.save(reasonDetail);

      // If this is a full refund and the refund is completed immediately
      if (amount === originalTransaction.amount) {
        // Calculate points to deduct
        const pointsToDeduct = originalTransaction.pointsEarned;

        if (pointsToDeduct > 0) {
          await this.updateUserPoints(userId, -pointsToDeduct);
        }
      }

      return this.transactionRepository.findById(savedTransaction.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Complete a refund transaction
   */
  async completeRefundTransaction(transactionId: number): Promise<Transaction> {
    try {
      const transaction =
        await this.transactionRepository.findById(transactionId);

      if (
        !transaction ||
        transaction.type !== 'refund' ||
        transaction.status !== 'pending'
      ) {
        throw new BadRequestException('Invalid refund transaction');
      }

      // Update transaction status
      transaction.status = 'completed';
      await this.transactionRepository.save(transaction);

      // Get original transaction ID
      const originalTransactionDetail =
        await this.transactionDetailRepository.findOne({
          where: {
            transactionId: transaction.id,
            key: 'originalTransactionId',
          },
        });

      if (originalTransactionDetail) {
        const originalTransactionId = parseInt(originalTransactionDetail.value);

        // Get original transaction
        const originalTransaction = await this.transactionRepository.findById(
          originalTransactionId,
        );

        if (originalTransaction) {
          // If this is a full refund
          if (Math.abs(transaction.amount) === originalTransaction.amount) {
            // Update order status
            const order = await this.orderService.getOrderById(
              transaction.orderId,
            );
            order.status = 'cancelled';
            await this.orderService.updateOrder(order);
          }
        }
      }

      return this.transactionRepository.findById(transactionId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  /**
   * Get transactions for an order
   */
  async getOrderTransactions(orderId: number): Promise<Transaction[]> {
    return this.transactionRepository.findByOrderId(orderId);
  }

  /**
   * Get user transactions with pagination
   */
  async getUserTransactions(userId: number, queryDto: TransactionQueryDto) {
    const [transactions, count] =
      await this.transactionRepository.findByUserIdWithPagination(
        userId,
        queryDto,
        queryDto.type,
      );

    return {
      transactions,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / (queryDto.limit || 10)),
        currentPage: queryDto.page || 1,
        itemsPerPage: queryDto.limit || 10,
      },
    };
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(statsDto: TransactionStatsDto) {
    return this.transactionRepository.getTransactionStats(
      statsDto.startDate,
      statsDto.endDate,
    );
  }

  /**
   * Helper method to update user points
   */
  private async updateUserPoints(userId: number, pointsChange: number) {
    const user = await this.userService.findOne(userId);

    if (user) {
      const newPoints = Math.max(0, user.points + pointsChange);
      user.points = newPoints;
      await this.userService.updateUserPoints(user.id, newPoints);
    }
  }
}
