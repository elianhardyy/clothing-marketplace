import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // async validate(payload: any) {
  //   const user = await this.userService.validateUser(payload.sub);
  //   return {
  //     id: user.id,
  //     email: user.email,
  //     roles: payload.roles,
  //   };
  // }
  // constructor() {
  //   super({
  //     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //     secretOrKey: process.env.JWT_SECRET,
  //     ignoreExpiration: false,
  //   });
  // }
  async validate(payload: any) {
    const user = await this.userService.validateUser(payload.sub);
    console.log(user.userRoles.map((v, i) => v.role.name));
    return {
      id: user.id,
      email: user.email,
      roles: user.userRoles.map((v, i) => v.role.name), //['MERCHANT']
    };
  }
}
