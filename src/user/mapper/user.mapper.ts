import {
  LoginRequestDto,
  RegisterRequestDto,
} from '../dto/request/user-request.dto';
import {
  LoginResponseDto,
  RegisterResponseDto,
} from '../dto/response/user-response.dto';
import { User } from '../entities/user.entity';

export class UserMapper {
  static toEntityRegister(dto: RegisterRequestDto): User {
    const user = new User();
    user.name = dto.name;
    user.email = dto.email;
    user.password = dto.password;
    user.userRoles = [];
    return user;
  }

  static toResponseRegister(user: User): RegisterResponseDto {
    return {
      name: user.name,
      email: user.email,
      role: user.userRoles?.length
        ? user.userRoles.map((userRole) => userRole.role?.name).filter(Boolean)
        : [],
    };
  }

  static toEntityLogin(dto: LoginRequestDto): any {}

  static toResponseLogin(token: string): LoginResponseDto {
    return {
      accessToken: token,
    };
  }
}
