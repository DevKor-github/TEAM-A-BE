import { Module } from '@nestjs/common';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { FriendshipEntity } from 'src/entities/friendship.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipRepository } from './friendship.repository';
import { UserModule } from 'src/user/user.module';
import { TimeTableModule } from 'src/timetable/timetable.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendshipEntity]),
    UserModule,
    TimeTableModule,
  ],
  controllers: [FriendshipController],
  providers: [FriendshipService, FriendshipRepository],
})
export class FriendshipModule {}
