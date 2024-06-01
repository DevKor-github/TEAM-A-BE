import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { KuVerificationEntity } from './ku-verification.entity';
import { FriendshipEntity } from './friendship.entity';
import { TimeTableEntity } from './timetable.entity';
import { StoryEntity } from './story.entity';

@Entity('user')
export class UserEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar', { unique: true })
  username: string;

  @Column('varchar')
  password: string;

  @Column('varchar', { nullable: true })
  homeUniversity: string | null;

  @Column('varchar', { nullable: true })
  language: string | null;

  @Column('varchar', { nullable: true })
  country: string | null;

  @Column('varchar', { nullable: true })
  major: string | null;

  @Column('tinyint', { default: false })
  isVerified: boolean;

  @Column('varchar', { nullable: true })
  name: string | null;

  @Column('timestamp', { nullable: true })
  startDay: Date | null;

  @Column('timestamp', { nullable: true })
  endDay: Date | null;

  @Column('int', { default: 0 })
  point: number;

  @Column('varchar', { nullable: true })
  refreshToken: string | null;

  @OneToOne(
    () => KuVerificationEntity,
    (kuVerification) => kuVerification.user,
    { cascade: true },
  )
  kuVerification: KuVerificationEntity;

  @OneToMany(() => FriendshipEntity, (friendship) => friendship.fromUser)
  sentFriendRequests: FriendshipEntity[];

  @OneToMany(() => FriendshipEntity, (friendship) => friendship.toUser)
  receivedFriendRequests: FriendshipEntity[];

  @OneToMany(() => TimeTableEntity, (timeTableEntity) => timeTableEntity.user)
  timeTables: TimeTableEntity[];

  @OneToMany(() => StoryEntity, (storyEntity) => storyEntity.user)
  stories: StoryEntity[];
}
