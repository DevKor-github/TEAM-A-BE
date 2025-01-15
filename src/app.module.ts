import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { CourseModule } from './course/course.module';
import { TimetableModule } from './timetable/timetable.module';
import * as path from 'path';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { FriendshipModule } from './friendship/friendship.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ClubModule } from './home/club/club.module';
import { CommonModule } from './common/common.module';
import { CourseReviewModule } from './course-review/course-review.module';
import { BoardModule } from './community/board/board.module';
import { PostModule } from './community/post/post.module';
import { CommentModule } from './community/comment/comment.module';
import { NoticeModule } from './notice/notice.module';
import { CalendarModule } from './home/calendar/calendar.module';
import { ReportModule } from './community/report/report.module';
import { AttendanceCheckModule } from './attendance-check/attendance-check.module';
import { APP_FILTER } from '@nestjs/core';
import { UnhandledExceptionFilter } from './common/filter/unhandled-exception.filter';
import { KukeyExceptionFilter } from './common/filter/kukey-exception.filter';
import { BannerModule } from './home/banner/banner.module';

console.log(`.env.${process.env.NODE_ENV}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: Number(configService.get('DB_PORT')),
        database: configService.get('DB_DATABASE'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        entities: [path.join(__dirname, '/entities/**/*.entity.{js, ts}')],
        synchronize: true,
        logging: true,
        timezone: 'Asia/Seoul',
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
      }),
    }),
    CommonModule,
    UserModule,
    AuthModule,
    CourseModule,
    FriendshipModule,
    TimetableModule,
    ScheduleModule,
    CourseReviewModule,
    BoardModule,
    PostModule,
    CommentModule,
    ClubModule,
    NoticeModule,
    CalendarModule,
    ReportModule,
    AttendanceCheckModule,
    BannerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: UnhandledExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: KukeyExceptionFilter,
    },
  ],
})
export class AppModule {}
