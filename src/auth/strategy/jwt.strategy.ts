import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // constructor(
  //   private configService: ConfigService,
  //   private userService: UserService,
  // ) {
  //   super({
  //     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //     ignoreExpiration: false,
  //     secretOrKey: configService.get<string>('JWT_SECRET'),
  //   });
  // }

  // async validate(payload: any) {
  //   const user = await this.userService.validateUser(payload.sub);
  //   return {
  //     id: user.id,
  //     email: user.email,
  //     roles: payload.roles,
  //   };
  // }
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }
  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      firstname: payload.firstname,
    };
  }
}
