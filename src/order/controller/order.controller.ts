// src/order/controllers/order.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { OrderService } from '../service/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order.dto';
import { ProcessPaymentDto } from '../dto/process-payment.dto';
import { OrderQueryDto } from '../dto/order-query.dto';
import { OrderStatsDto } from '../dto/order-stats.dto';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { ApiResponse } from 'src/utils/api.response';
import { Response } from 'express';
import { UserType } from 'src/user/enums/user-type.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.MERCHANT, UserType.CUSTOMER)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto,
    @Res() res: Response,
  ) {
    const order = await this.orderService.createOrder(
      req.user.id,
      createOrderDto,
    );
    return ApiResponse.success(res, 'Order created successfully', order, 201);
  }

  @Get('my-orders')
  async getMyOrders(
    @Request() req,
    @Query() query: OrderQueryDto,
    @Res() res: Response,
  ) {
    const { orders, pagination } = await this.orderService.getUserOrders(
      req.user.id,
      query,
    );
    return ApiResponse.success(
      res,
      'User orders retrieved successfully',
      orders,
      200,
      pagination,
    );
  }

  @Get(':id')
  async getOrderById(
    @Request() req,
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    // Check if user is authorized to access this order
    const isAuthorized = await this.orderService.isUserAuthorized(
      id,
      req.user.id,
      req.user.roles.includes('admin') || req.user.roles.includes('merchant'),
    );

    if (!isAuthorized) {
      return ApiResponse.error(
        res,
        'You are not authorized to access this order',
        403,
      );
    }

    const order = await this.orderService.getOrderById(id);
    return ApiResponse.success(res, 'Order retrieved successfully', order);
  }

  @Get()
  async getAllOrders(@Query() query: OrderQueryDto, @Res() res: Response) {
    const { orders, pagination } = await this.orderService.getAllOrders(query);
    return ApiResponse.success(
      res,
      'Orders retrieved successfully',
      orders,
      200,
      pagination,
    );
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @Res() res: Response,
  ) {
    const updatedOrder = await this.orderService.updateOrderStatus(
      id,
      updateStatusDto,
    );
    return ApiResponse.success(
      res,
      'Order status updated successfully',
      updatedOrder,
    );
  }

  @Post(':id/pay')
  async processPayment(
    @Request() req,
    @Param('id') id: number,
    @Body() paymentDto: ProcessPaymentDto,
    @Res() res: Response,
  ) {
    const transaction = await this.orderService.processOrderPayment(
      id,
      req.user.id,
      paymentDto,
    );
    return ApiResponse.success(
      res,
      'Payment processed successfully',
      transaction,
    );
  }

  @Get('stats/overview')
  async getOrderStats(@Query() query: OrderStatsDto, @Res() res: Response) {
    const stats = await this.orderService.getOrderStats(query);
    return ApiResponse.success(
      res,
      'Order statistics retrieved successfully',
      stats,
    );
  }

  @Get('customers/list')
  async getMerchantCustomers(
    @Query() query: OrderQueryDto,
    @Res() res: Response,
  ) {
    const { customers, pagination } =
      await this.orderService.getMerchantCustomers(query);
    return ApiResponse.success(
      res,
      'Customers retrieved successfully',
      customers,
      200,
      pagination,
    );
  }
}
