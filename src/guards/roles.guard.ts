import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { User } from 'src/user/entities/user.entity';
import { UserType } from 'src/user/enums/user-type.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user }: { user: User | any } = context.switchToHttp().getRequest();
    // return (
    //   user.userRoles &&
    //   user.userRoles.some((ur) =>
    //     requiredRoles.some((role) => ur.role.name === role),
    //   )
    // );
    // console.log(user);
    return requiredRoles.some(
      (role) => user.roles && user.roles.includes(role),
    );
  }
}
