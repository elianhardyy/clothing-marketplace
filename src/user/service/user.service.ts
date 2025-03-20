import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  LoginRequestDto,
  RegisterRequestDto,
} from '../dto/request/user-request.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import {
  LoginResponseDto,
  LogoutResponseDto,
  RegisterResponseDto,
} from '../dto/response/user-response.dto';
import { UserRepository } from '../repository/user.repository';
import { UserType } from '../enums/user-type.enum';
import { UserMapper } from '../mapper/user.mapper';
import { JwtService } from '@nestjs/jwt';
import { RoleRepository } from '../repository/role.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) {}

  async createCustomer(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.createUserWithRole(dto, UserType.CUSTOMER);
  }

  async createMerchant(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    return this.createUserWithRole(dto, UserType.MERCHANT);
  }

  private async createUserWithRole(
    dto: RegisterRequestDto,
    userType: UserType,
  ): Promise<RegisterResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) throw new ConflictException('Email already exists');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const role = await this.roleRepository.findByName(userType);
      if (!role) {
        throw new Error(`Role ${userType} not found`);
      }

      const user = UserMapper.toEntityRegister(dto);
      const savedUser = await queryRunner.manager.save(User, user);

      const userRole = new UserRole();
      userRole.userId = savedUser.id;
      userRole.roleId = role.id;
      userRole.user = savedUser;
      userRole.role = role;

      await queryRunner.manager.save(UserRole, userRole);

      await queryRunner.commitTransaction();

      // Load the user with roles after transaction completion
      const userWithRoles = await this.userRepository.findOne({
        where: { id: savedUser.id },
        relations: ['userRoles', 'userRoles.role'],
      });

      return UserMapper.toResponseRegister(userWithRoles);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new ConflictException('Email not found');
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const token = this.jwtService.sign(payload);
    return UserMapper.toResponseLogin(token);
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.points = points;
    return this.userRepository.save(user);
  }
  async logout(): Promise<LogoutResponseDto> {
    try {
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
