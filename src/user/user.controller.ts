import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { SetResponseDto } from './dto/set-response.dto';
import {
  SetExchangeDayReqeustDto,
  SetProfileRequestDto,
} from './dto/set-profile-request.dto';
import { GetProfileResponseDto } from './dto/get-profile-response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetPointHistoryResponseDto } from './dto/get-point-history.dto';
import { DeleteUserResponseDto } from './dto/delete-user.dto';
import { PurchaseItemRequestDto } from './dto/purchase-item-request.dto';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { TransactionManager } from 'src/decorators/manager.decorator';
import { EntityManager } from 'typeorm';
import { PointService } from './point.service';
import { PurchaseItemResponseDto } from './dto/purchase-item-response-dto';
import {
  LanguageRequestDto,
  LanguageResponseDto,
} from './dto/user-language.dto';

@ApiTags('User')
@ApiBearerAuth('accessToken')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly pointService: PointService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '프로필 설정',
    description: '프로필을 설정(변경) 합니다',
  })
  @ApiBody({
    type: SetProfileRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '프로필 설정 성공',
    type: SetResponseDto,
  })
  @Patch('/profile')
  async setProfile(
    @Body() profileDto: SetProfileRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SetResponseDto> {
    const id = user.id;
    return await this.userService.setProfile(id, profileDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '교환 남은 일자 설정',
    description: '교환학생 남은 일자를 설정(변경) 합니다',
  })
  @ApiBody({
    type: SetExchangeDayReqeustDto,
  })
  @ApiResponse({
    status: 200,
    description: '교환 남은 일자 설정 성공',
    type: SetResponseDto,
  })
  @Patch('/exchange-day')
  async setExchangeDay(
    @Body() requestDto: SetExchangeDayReqeustDto,
    @User() user: AuthorizedUserDto,
  ): Promise<SetResponseDto> {
    const id = user.id;
    return await this.userService.setExchangeDay(id, requestDto);
  }

  @ApiOperation({
    summary: '프로필 조회',
    description: '프로필을 조회 합니다',
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: GetProfileResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(
    @User() user: AuthorizedUserDto,
  ): Promise<GetProfileResponseDto> {
    const id = user.id;
    return await this.userService.getProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '언어 추가',
    description: '언어를 추가 합니다',
  })
  @ApiBody({
    type: LanguageRequestDto,
  })
  @ApiResponse({
    status: 201,
    description: '언어 추가 성공',
    type: LanguageResponseDto,
  })
  @Post('/language')
  async appendLanguage(
    @Body() requestDto: LanguageRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<LanguageResponseDto> {
    const id = user.id;
    return await this.userService.appendLanguage(id, requestDto.language);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '언어 삭제',
    description: '언어를 삭제 합니다',
  })
  @ApiBody({
    type: LanguageRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: '언어 삭제 성공',
    type: LanguageResponseDto,
  })
  @Delete('/language')
  async deleteLanguage(
    @Body() requestDto: LanguageRequestDto,
    @User() user: AuthorizedUserDto,
  ): Promise<LanguageResponseDto> {
    const id = user.id;
    return await this.userService.deleteLanguage(id, requestDto.language);
  }

  @ApiOperation({
    summary: '포인트 내역 조회',
    description: '포인트 획득/사용 내역을 조회 합니다',
  })
  @ApiResponse({
    status: 200,
    description: '포인트 내역 조회 성공',
    type: [GetPointHistoryResponseDto],
  })
  @UseGuards(JwtAuthGuard)
  @Get('point-history')
  async getPointHistory(
    @User() user: AuthorizedUserDto,
  ): Promise<GetPointHistoryResponseDto[]> {
    return await this.pointService.getPointHistory(user);
  }

  @ApiOperation({
    summary: '아이템 구매',
    description: '포인트 샵에서 아이템을 구매합니다.',
  })
  @ApiBody({ type: PurchaseItemRequestDto })
  @ApiResponse({
    status: 201,
    description: '아이템 구매 및 적용 성공',
    type: PurchaseItemResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Post('purchase-item')
  async purchaseItem(
    @TransactionManager() transactionManager: EntityManager,
    @User() user: AuthorizedUserDto,
    @Body() requestDto: PurchaseItemRequestDto,
  ): Promise<PurchaseItemResponseDto> {
    return await this.pointService.purchaseItem(
      transactionManager,
      user.id,
      requestDto,
    );
  }

  @ApiOperation({
    summary: '회원탈퇴',
    description: '사용자의 계정을 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '회원탈퇴 성공',
    type: DeleteUserResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteUser(
    @User() user: AuthorizedUserDto,
  ): Promise<DeleteUserResponseDto> {
    return this.userService.softDeleteUser(user.id);
  }
}
