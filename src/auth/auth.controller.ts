import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { RefreshAuthGuard } from './guards/refresh-auth-guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from './dto/authorized-user-dto';
import { VerificationRequestDto } from './dto/verification-request.dto';
import { VerifyEmailRequestDto } from './dto/verify-email-request.dto';
import { AccessTokenDto } from './dto/accessToken.dto';
import { VerificationResponseDto } from './dto/verification-response.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScreenshotVerificationRequestDto } from './dto/screenshot-verification-request.dto';
('./guards/jwt-auth.guard');
import { VerifyAuthGuard } from './guards/verify-auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { VerifyScreenshotRequestDto } from './dto/verify-screenshot-request.dto';
import { VerifyScreenshotResponseDto } from './dto/verify-screenshot-response.dto';
import { GetScreenshotVerificationsResponseDto } from './dto/get-screenshot-verifications-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async logIn(@User() user: AuthorizedUserDto): Promise<LoginResponseDto> {
    console.log('user : ', user);
    return await this.authService.logIn(user);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@User() user: AuthorizedUserDto): AccessTokenDto {
    console.log('user : ', user);
    return this.authService.refreshToken(user);
  }

  @Post('request-email-verification')
  async requestEmailVerification(
    @Body() body: VerificationRequestDto,
  ): Promise<VerificationResponseDto> {
    return await this.authService.requestEmailVerification(body.email);
  }

  @Post('verify-email')
  async VerifyEmailByToken(
    @Body() body: VerifyEmailRequestDto,
  ): Promise<VerifyEmailResponseDto> {
    return await this.authService.verifyEmail(body.email, body.verifyToken);
  }

  @UseGuards(VerifyAuthGuard)
  @Post('request-screenshot-verification')
  @UseInterceptors(FileInterceptor('screenshot'))
  async requestScreenshotVerification(
    @UploadedFile() screenshot: Express.Multer.File,
    @Body() body: ScreenshotVerificationRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<VerificationResponseDto> {
    if (!screenshot) {
      throw new BadRequestException('screenshot should be uploaded');
    }
    return await this.authService.createScreenshotRequest(
      screenshot,
      body.studentNumber,
      user.id,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/requests')
  async getScreenshotVerifyRequests(): Promise<
    GetScreenshotVerificationsResponseDto[]
  > {
    return this.authService.getScreenshotVerifyRequests();
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/request/:id')
  async verifyScreenshotReqeust(
    @Param('id') id: number,
    @Body() body: VerifyScreenshotRequestDto,
  ): Promise<VerifyScreenshotResponseDto> {
    return await this.authService.verifyScreenshotReqeust(id, body.verify);
  }
}
