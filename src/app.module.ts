import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from './course/course.module';
import { TimeTableModule } from './timetable/timetable.module';
import * as path from 'path';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { FriendshipModule } from './friendship/friendship.module';
import { ScheduleModule } from './schedule/schedule.module';
import { StoryModule } from './story/story.module';
import { CommonModule } from './common/common.module';

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
    CacheModule.register({
      ttl: 300000,
      max: 100,
      isGlobal: true,
    }),
    CommonModule,
    UserModule,
    AuthModule,
    CourseModule,
    FriendshipModule,
    TimeTableModule,
    ScheduleModule,
    StoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
