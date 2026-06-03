import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '@eduerp/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'your-super-secret-jwt-key-change-in-production',
    });
  }

  async validate(payload: TokenPayload) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    };
  }
}
