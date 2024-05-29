import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TimeTableEntity } from 'src/entities/timetable.entity';
import { TimeTableDto } from './dto/timetable.dto';
import { TimeTableService } from './timetable.service';
import { TimeTableCourseEntity } from 'src/entities/timetable-course.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateTimeTableDto } from './dto/create-timetable.dto';
import { GetTimeTableByUserIdResponseDto } from './dto/userId-timetable.dto';
import { GetTimeTableByTimeTableIdResponseDto } from './dto/timetableId-timetable.dto';
import { UpdateTimeTableNameDto } from './dto/update-timetable-name.dto';

@Controller('timetable')
@UseGuards(JwtAuthGuard) // 시간표 관련 API는 인증 필요해서 JwtAuthGuard 사용
export class TimeTableController {
  constructor(private readonly timeTableService: TimeTableService) {}

  // timetable 에 course 추가 (존재하는 강의가 있을 때 추가하지 못하도록)
  @Post('course')
  async createTimeTableCourse(
    @Query('timeTableId') timeTableId: number,
    @Query('courseId') courseId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<TimeTableCourseEntity> {
    return await this.timeTableService.createTimeTableCourse(
      timeTableId,
      courseId,
      user,
    );
  }

  // 시간표 생성 (시간표 틀)
  @Post()
  async createTimeTable(
    @Body() createTimeTableDto: CreateTimeTableDto,
    @User() user: AuthorizedUserDto,
  ): Promise<TimeTableEntity> {
    return await this.timeTableService.createTimeTable(
      createTimeTableDto,
      user,
    );
  }

  // 대표시간표 가져오기
  @Get('/main-timetable')
  async getMainTimeTable(
    @Body() timeTableDto: TimeTableDto,
    @User() user: AuthorizedUserDto,
  ): Promise<TimeTableEntity> {
    return await this.timeTableService.getMainTimeTable(timeTableDto, user);
  }

  // 유저id -> 유저가 가지고 있는 시간표 id 리스트, 각각의 학기, 대표 시간표 여부, 시간표 이름
  @Get('/user')
  async getTimeTableByUserId(
    @User() user: AuthorizedUserDto,
  ): Promise<GetTimeTableByUserIdResponseDto[]> {
    return await this.timeTableService.getTimeTableByUserId(user.id);
  }

  // 특정 시간표 가져오기
  @Get('/:timeTableId')
  async getTimeTableByTimeTableId(
    @Param('timeTableId') timeTableId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<GetTimeTableByTimeTableIdResponseDto[]> {
    return await this.timeTableService.getTimeTableByTimeTableId(
      timeTableId,
      user,
    );
  }

  // 시간표에 등록한 강의 삭제
  @Delete('/course')
  async deleteTimeTableCourse(
    @Query('timeTableId') timeTableId: number,
    @Query('courseId') courseId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<void> {
    return await this.timeTableService.deleteTimeTableCourse(
      timeTableId,
      courseId,
      user,
    );
  }

  // 시간표 삭제
  @Delete('/:timeTableId')
  async deleteTimeTable(
    @Param('timeTableId') timeTableId: number,
    @User() user: AuthorizedUserDto,
  ): Promise<void> {
    return await this.timeTableService.deleteTimeTable(timeTableId, user);
  }

  // 시간표 이름 변경
  @Patch('/name/:timeTableId')
  async updateTimeTableName(
    @Param('timeTableId') timeTableId: number,
    @User() user: AuthorizedUserDto,
    @Body() updateTimeTableNameDto: UpdateTimeTableNameDto,
  ): Promise<TimeTableEntity> {
    return await this.timeTableService.updateTimeTableName(
      timeTableId,
      user,
      updateTimeTableNameDto.tableName,
    );
  }

  // 대표 시간표 변경
  @Patch('/:timeTableId')
  async updateMainTimeTable(
    @Param('timeTableId') timeTableId: number,
    @User() user: AuthorizedUserDto,
    @Body() timeTableDto: TimeTableDto,
  ): Promise<TimeTableEntity> {
    return await this.timeTableService.updateMainTimeTable(
      timeTableId,
      user,
      timeTableDto,
    );
  }
}