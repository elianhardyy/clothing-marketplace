// src/order/services/order.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderRepository } from '../repository/order.repository';
import { OrderItemRepository } from '../repository/order-item.repository';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order.dto';
import { ProcessPaymentDto } from '../dto/process-payment.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { OrderStatsDto } from '../dto/order-stats.dto';
import { TransactionService } from 'src/transaction/service/transaction.service';
import { UserRepository } from 'src/user/repository/user.repository';
import { ProductRepository } from 'src/product/repository/product.repository';
import { ProductService } from 'src/product/service/product.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductRepository,
    private readonly productService: ProductService,
  ) {}

  /**
   * Create a new order
   */
  async createOrder(userId: number, orderData: CreateOrderDto): Promise<Order> {
    try {
      const {
        items,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        paymentMethod,
      } = orderData;

      // Validate items
      if (!items || items.length === 0) {
        throw new BadRequestException('Items are required');
      }

      // Calculate totals and validate items
      let totalAmount = 0;
      const shippingPrice = 10; // Fixed shipping price
      const orderItems = [];
      const productsToUpdate = [];

      for (const item of items) {
        // Check if product exists and has sufficient stock
        const product = await this.productService.getProductById(
          item.productId,
        );

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}`,
          );
        }

        const unitPrice = parseFloat(product.price.toString());
        const itemTotalPrice = unitPrice * item.quantity;
        totalAmount += itemTotalPrice;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: unitPrice,
          totalPrice: itemTotalPrice,
        });

        // Prepare product stock update
        product.stock -= item.quantity;
        productsToUpdate.push(product);
      }

      // Create order
      const order = new Order();
      order.userId = userId;
      order.status = 'pending';
      order.totalAmount = totalAmount;
      order.shippingAddress = shippingAddress;
      order.shippingCity = shippingCity;
      order.shippingState = shippingState;
      order.shippingZip = shippingZip;
      order.shippingCountry = shippingCountry;
      order.paymentMethod = paymentMethod;
      order.shippingPrice = shippingPrice;
      order.isPaid = false;
      order.isDelivered = false;

      const savedOrder = await this.orderRepository.save(order);

      // Create order items
      const orderItemEntities = orderItems.map((item) => {
        const orderItem = new OrderItem();
        orderItem.orderId = savedOrder.id;
        orderItem.productId = item.productId;
        orderItem.quantity = item.quantity;
        orderItem.unitPrice = item.unitPrice;
        orderItem.totalPrice = item.totalPrice;
        return orderItem;
      });

      await this.orderItemRepository.save(orderItemEntities);

      // Update product stock
      for (const product of productsToUpdate) {
        await this.productService.updateProductTransaction(product.id, {
          stock: product.stock,
        });
      }

      // Return complete order
      return this.getOrderById(savedOrder.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an order
   */
  async updateOrder(order: Order): Promise<Order> {
    return this.orderRepository.save(order);
  }

  /**
   * Get order by ID with all details
   */
  async getOrderById(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  /**
   * Check if user is authorized to access this order
   */
  async isUserAuthorized(
    orderId: number,
    userId: number,
    isMerchant: boolean,
  ): Promise<boolean> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return isMerchant || order.userId === userId;
  }

  /**
   * Get all orders with pagination
   */
  async getAllOrders(query: OrderQueryDto) {
    return this.orderRepository.findAll({
      page: query.page,
      limit: query.limit,
      status: query.status,
    });
  }

  /**
   * Get user orders with pagination
   */
  async getUserOrders(userId: number, query: OrderQueryDto) {
    return this.orderRepository.findByUserId(userId, {
      page: query.page,
      limit: query.limit,
      status: query.status,
    });
  }

  /**
   * Get merchant customers
   */
  async getMerchantCustomers(query: OrderQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [customers, total] = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.points',
        'user.lastLogin',
        'user.createdAt',
      ])
      .leftJoin('user.orders', 'order')
      .where('order.id IS NOT NULL')
      .addSelect([
        'order.id',
        'order.totalAmount',
        'order.status',
        'order.createdAt',
      ])
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      customers,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: number,
    statusData: UpdateOrderStatusDto,
  ): Promise<Partial<Order>> {
    try {
      const { status } = statusData;

      // Validate status
      const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new BadRequestException(
          'Invalid status. Must be one of: processing, shipped, delivered, cancelled',
        );
      }

      const order = await this.orderRepository.findById(id);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      order.status = status;

      if (status === 'delivered') {
        order.isDelivered = true;
        order.deliveredAt = new Date();
      }

      if (status === 'cancelled') {
        const orderItems = await this.orderItemRepository.findByOrderId(
          order.id,
        );

        for (const item of orderItems) {
          const product = await this.productRepository.findOne({
            where: { id: item.productId },
          });

          if (product) {
            product.stock += item.quantity;
            await this.productService.updateProduct(product.id, {
              stock: product.stock,
            });
          }
        }
      }

      await this.orderRepository.save(order);

      return {
        id: order.id,
        status: order.status,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process order payment
   */
  async processOrderPayment(
    orderId: number,
    userId: number,
    paymentData: ProcessPaymentDto,
  ) {
    const order = await this.getOrderById(orderId);

    if (order.userId !== userId) {
      throw new ForbiddenException('Order does not belong to the user');
    }

    if (order.isPaid) {
      throw new BadRequestException('Order is already paid');
    }

    // Calculate total amount
    const totalAmount =
      parseFloat(order.totalAmount.toString()) +
      parseFloat(order.shippingPrice.toString());

    // Process payment through transaction service
    const transaction = await this.transactionService.createPaymentTransaction({
      userId,
      orderId,
      amount: totalAmount,
      paymentMethod: order.paymentMethod,
      paymentDetails: paymentData.paymentDetails,
    });

    // Update order payment status
    if (transaction) {
      order.isPaid = true;
      order.paidAt = new Date();
      await this.orderRepository.save(order);
    }

    return transaction;
  }

  /**
   * Get order statistics
   */
  async getOrderStats(statsQuery: OrderStatsDto) {
    const { startDate, endDate, status } = statsQuery;

    return this.orderRepository.getOrderStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      status,
    );
  }
}
