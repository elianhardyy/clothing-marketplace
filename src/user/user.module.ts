import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { UserRepository } from './repository/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { RoleRepository } from './repository/role.repository';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { ProductModule } from 'src/product/product.module';
import { OrderModule } from 'src/order/order.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { JwtAuthGuard } from 'src/guards/jwt.guard';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Role, UserRole]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION_TIME') },
      }),
    }),

    forwardRef(() => TransactionModule),
    forwardRef(() => OrderModule),
    forwardRef(() => ProductModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    RoleRepository,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [UserService, UserRepository, RoleRepository],
})
export class UserModule {}
