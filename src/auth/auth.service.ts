import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenDto } from './dto/jwtToken.dto';
import { AuthorizedUserDto } from './dto/authorized-user-dto';
import { EmailService } from 'src/common/email.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AccessTokenDto } from './dto/accessToken.dto';
import { VerificationResponseDto } from './dto/verification-response.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { KuVerificationRepository } from './ku-verification.repository';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { ConfigService } from '@nestjs/config';
import { VerifyScreenshotResponseDto } from './dto/verify-screenshot-response.dto';
import { GetScreenshotVerificationsResponseDto } from './dto/get-screenshot-verifications-request.dto';
import { FileService } from 'src/common/file.service';
import { UserService } from 'src/user/user.service';
import { checkPossibleResponseDto } from 'src/user/dto/check-possible-response.dto';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { ChangePasswordResponseDto } from './dto/change-password-response.dto';
import { SendTempPasswordResponseDto } from './dto/send-temporary-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(KuVerificationRepository)
    private readonly kuVerificationRepository: KuVerificationRepository,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly fileService: FileService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthorizedUserDto> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new BadRequestException('이메일이 잘못되었습니다.');
    }

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    return new AuthorizedUserDto(user.id, user.username);
  }

  async createToken(
    user: AuthorizedUserDto,
    keepingLogin: boolean,
  ): Promise<JwtTokenDto> {
    const id = user.id;
    const tokenDto = new JwtTokenDto(
      this.createAccessToken(user),
      this.createRefreshToken(id, keepingLogin),
    );
    const isSet = await this.userService.setCurrentRefresthToken(
      id,
      tokenDto.refreshToken,
    );
    if (!isSet) {
      throw new NotImplementedException('update refresh token failed!');
    }
    return tokenDto;
  }

  createAccessToken(user: AuthorizedUserDto): string {
    const payload = {
      id: user.id,
      username: user.username,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '5m',
    });
  }

  createRefreshToken(id: number, keepingLogin: boolean): string {
    const expiresIn = keepingLogin ? '14d' : '2d';
    return this.jwtService.sign(
      {},
      {
        expiresIn: expiresIn,
      },
    );
  }

  async refreshTokenMatches(
    refreshToken: string,
    id: number,
  ): Promise<AuthorizedUserDto> {
    const user = await this.userService.findUserById(id);

    if (user.refreshToken === null) {
      throw new BadRequestException(
        "There's no refresh token! Please login first",
      );
    }

    const isMatches = await compare(refreshToken, user.refreshToken);

    if (!isMatches) {
      throw new BadRequestException('refreshToken is not matched!');
    }

    return new AuthorizedUserDto(user.id, user.username);
  }

  async logIn(
    user: AuthorizedUserDto,
    keepingLogin: boolean,
  ): Promise<LoginResponseDto> {
    const verified = await this.userService.checkUserVerified(user.id);
    const token = await this.createToken(user, keepingLogin);
    return new LoginResponseDto(token, verified);
  }

  async logout(user: AuthorizedUserDto) {
    const result = await this.userService.setCurrentRefresthToken(
      user.id,
      null,
    );
    return new LogoutResponseDto(result);
  }

  refreshToken(user: AuthorizedUserDto): AccessTokenDto {
    const accessToken = this.createAccessToken(user);
    return new AccessTokenDto(accessToken);
  }

  async requestEmailVerification(
    email: string,
  ): Promise<VerificationResponseDto> {
    const verifyToken = this.generateRandomNumber();
    console.log('caching data: ', email, verifyToken);
    await this.cacheManager.set(email, verifyToken);
    await this.emailService.sendVerityToken(email, verifyToken);
    return new VerificationResponseDto(true);
  }

  async verifyEmail(
    email: string,
    verifyToken: number,
  ): Promise<VerifyEmailResponseDto> {
    const cache_verifyToken = await this.cacheManager.get(email);
    if (!cache_verifyToken) {
      throw new NotFoundException('해당 메일로 전송된 인증번호가 없습니다.');
    } else if (cache_verifyToken !== verifyToken) {
      throw new UnauthorizedException('인증번호가 일치하지 않습니다.');
    } else {
      await this.cacheManager.del(email);
      return new VerifyEmailResponseDto(true);
    }
  }

  private generateRandomNumber(): number {
    const minm = 100000;
    const maxm = 999999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }

  async checkStudentNumberPossible(
    studentNumber: number,
  ): Promise<checkPossibleResponseDto> {
    const requests =
      await this.kuVerificationRepository.findRequestsByStudentNumber(
        studentNumber,
      );
    if (requests) {
      for (const request of requests) {
        if (request.user.isVerified) {
          return new checkPossibleResponseDto(false);
        }
      }
    }

    return new checkPossibleResponseDto(true);
  }

  async createUserandScreenshotRequest(
    screenshot: Express.Multer.File,
    requestDto: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    if (!this.fileService.imagefilter(screenshot)) {
      throw new BadRequestException('Only image file can be uploaded!');
    }

    //유저생성
    const user = await this.userService.createUser({
      email: requestDto.email,
      password: requestDto.password,
      username: requestDto.username,
      name: requestDto.name,
      country: requestDto.country,
      homeUniversity: requestDto.homeUniversity,
      major: requestDto.major,
    });

    const studentNumber = requestDto.studentNumber;

    //요청 생성
    const filename = await this.fileService.uploadFile(
      screenshot,
      'KuVerification',
      'screenshot',
    );

    await this.kuVerificationRepository.createVerificationRequest(
      filename,
      studentNumber,
      user,
    );

    return new SignUpResponseDto(true, studentNumber);
  }

  validateAdmin(id: string, password: string): boolean {
    return (
      id === this.configService.get('ADMIN_ID') &&
      password === this.configService.get('ADMIN_PASSWORD')
    );
  }

  async getScreenshotVerifyRequests(): Promise<
    GetScreenshotVerificationsResponseDto[]
  > {
    const requests = await this.kuVerificationRepository.getRequests();
    const results = requests
      .filter((request) => !request.user.isVerified)
      .map((request) => {
        const result: GetScreenshotVerificationsResponseDto = {
          id: request.id,
          imgDir: this.fileService.makeUrlByFileDir(request.imgDir),
          studentNumber: request.studentNumber,
          lastUpdated: request.updatedAt,
        };
        return result;
      });
    return results;
  }

  async verifyScreenshotReqeust(
    id: number,
    verify: boolean,
  ): Promise<VerifyScreenshotResponseDto> {
    const request = await this.kuVerificationRepository.findRequestById(id);
    if (verify) {
      const userId = request.user.id;
      const isVerified = await this.userService.verifyUser(userId, verify);
      if (!isVerified) {
        throw new NotImplementedException('reqeust allow failed!');
      }
      const requests =
        await this.kuVerificationRepository.findRequestsByStudentNumber(
          request.studentNumber,
        );
      for (const otherRequest of requests) {
        if (otherRequest.id === request.id) {
          continue;
        }

        await this.deleteRequest(otherRequest.id);
      }
    } else {
      await this.deleteRequest(request.id);
    }
    return new VerifyScreenshotResponseDto(true);
  }

  async deleteRequest(requestId: number): Promise<void> {
    const request =
      await this.kuVerificationRepository.findRequestById(requestId);
    await this.userService.deleteUser(request.user.id);
    await this.fileService.deleteFile(request.imgDir);
  }

  async updatePassword(
    userId: number,
    newPassword: string,
  ): Promise<ChangePasswordResponseDto> {
    const updateResult = await this.userService.updatePassword(
      userId,
      newPassword,
    );
    if (!updateResult) {
      throw new NotImplementedException('Change password failed!');
    }

    return new ChangePasswordResponseDto(updateResult);
  }

  async sendTemporaryPassword(
    email: string,
  ): Promise<SendTempPasswordResponseDto> {
    const user = await this.userService.findUserByEmail(email);
    const tempPassword = this.generateTempPassword(10);

    const isUpdated = await this.userService.updatePassword(
      user.id,
      tempPassword,
    );
    if (!isUpdated) {
      throw new NotImplementedException('Change password failed!');
    }
    await this.emailService.sendTempPassword(email, tempPassword);
    return new SendTempPasswordResponseDto(true);
  }

  generateTempPassword(len: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < len; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }
}
