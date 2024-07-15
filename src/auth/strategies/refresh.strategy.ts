import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { AuthorizedUserDto } from '../dto/authorized-user-dto';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(request: Request, payload: any): Promise<AuthorizedUserDto> {
    const refreshToken = request.headers.authorization.split(' ')[1];
    const user = await this.authService.refreshTokenMatches(
      refreshToken,
      payload.id,
    );
    user.keepingLogin = payload.keepingLogin;

    return user;
  }
}
