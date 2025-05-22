// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(  Strategy) {

  constructor(private readonly configService: ConfigService) {
  super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    
  }

  async validate(payload: any) {
    // payload.sub, payload.email xestán disponibles en req.user
    return { userId: payload.sub, email: payload.email };
  }
}
