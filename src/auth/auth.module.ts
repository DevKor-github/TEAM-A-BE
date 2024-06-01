import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { EmailService } from './email.service';
import { VerifyStrategy } from './strategies/verify.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KuVerificationEntity } from 'src/entities/ku-verification.entity';
import { KuVerificationRepository } from './ku-verification.repository';
import { AdminStrategy } from './strategies/admin.strategy';
import { UserModule } from 'src/user/user.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '30m' },
        };
      },
    }),
    TypeOrmModule.forFeature([KuVerificationEntity]),
    UserModule,
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    KuVerificationRepository,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    VerifyStrategy,
    AdminStrategy,
  ],
})
export class AuthModule {}
