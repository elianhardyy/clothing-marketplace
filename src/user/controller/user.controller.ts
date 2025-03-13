import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from '../service/user.service';
import {
  LoginRequestDto,
  RegisterRequestDto,
} from '../dto/request/user-request.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiResponse } from 'src/utils/api.response';
import {
  LoginResponseDto,
  RegisterResponseDto,
} from '../dto/response/user-response.dto';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup/merchant')
  async createMerchant(
    @Body() createUserDto: RegisterRequestDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const user: RegisterResponseDto =
        await this.userService.createMerchant(createUserDto);
      return ApiResponse.success(
        res,
        'User registered successfully',
        user,
        HttpStatus.CREATED,
      );
    } catch (error) {
      return ApiResponse.error(res, error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Post('/signup/customer')
  async createCustomer(
    @Body() createUserDto: RegisterRequestDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const user: RegisterResponseDto =
        await this.userService.createCustomer(createUserDto);
      return ApiResponse.success(
        res,
        'User registered successfully',
        user,
        HttpStatus.CREATED,
      );
    } catch (error) {
      return ApiResponse.error(res, error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/login')
  async login(
    @Body() loginDto: LoginRequestDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const user: LoginResponseDto = await this.userService.login(loginDto);
      return ApiResponse.success(res, 'Login successful', user, HttpStatus.OK);
    } catch (error) {
      return ApiResponse.error(res, error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}
