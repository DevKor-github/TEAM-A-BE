import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Res,
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
import { SignUpRequestDto } from './dto/sign-up-request.dto';
('./guards/jwt-auth.guard');
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { VerifyScreenshotRequestDto } from './dto/verify-screenshot-request.dto';
import { VerifyScreenshotResponseDto } from './dto/verify-screenshot-response.dto';
import { GetScreenshotVerificationsResponseDto } from './dto/get-screenshot-verifications-request.dto';
import { checkPossibleResponseDto } from 'src/user/dto/check-possible-response.dto';
import { Response } from 'express';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { UserService } from 'src/user/user.service';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginRequestDto } from './dto/login-request.dto';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { ChangePasswordResponseDto } from './dto/change-password-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async logIn(
    @User() user: AuthorizedUserDto,
    @Body() body: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    console.log('user : ', user);
    const keepingLogin = body.keepingLogin;
    return await this.authService.logIn(user, keepingLogin);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@User() user: AuthorizedUserDto): AccessTokenDto {
    console.log('user : ', user);
    return this.authService.refreshToken(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logOut(@User() user: AuthorizedUserDto): Promise<LogoutResponseDto> {
    return await this.authService.logout(user);
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

  @Post('sign-up')
  @UseInterceptors(FileInterceptor('screenshot'))
  async createUserandScreenshotRequest(
    @UploadedFile() screenshot: Express.Multer.File,
    @Body() body: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    if (!screenshot) {
      throw new BadRequestException('screenshot should be uploaded');
    }
    return await this.authService.createUserandScreenshotRequest(
      screenshot,
      body,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/requests')
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

  @Post('student-number/:studentNumber')
  async checkStudentNumberPossible(
    @Param('studentNumber') studentNumber: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<checkPossibleResponseDto> {
    const responseDto =
      await this.authService.checkStudentNumberPossible(studentNumber);
    const code = responseDto.possible ? 200 : 403;
    res.status(code);
    return responseDto;
  }

  @Post('username/:username')
  async checkUsernamePossible(
    @Param('username') username: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<checkPossibleResponseDto> {
    const responseDto = await this.userService.checkUsernamePossible(username);
    const code = responseDto.possible ? 200 : 403;
    res.status(code);
    return responseDto;
  }

  @Post('email/:email')
  async checkEmailPossible(
    @Param('email') email: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<checkPossibleResponseDto> {
    const responseDto = await this.userService.checkEmailPossible(email);
    const code = responseDto.possible ? 200 : 403;
    res.status(code);
    return responseDto;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async updatePassword(
    @User() user: AuthorizedUserDto,
    @Body() body: ChangePasswordRequestDto,
  ): Promise<ChangePasswordResponseDto> {
    return await this.authService.updatePassword(user.id, body.newPassword);
  }
}
