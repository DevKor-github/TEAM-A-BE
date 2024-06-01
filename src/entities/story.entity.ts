import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';

@Entity('story')
export class StoryEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column('timestamp')
  storyDate: Date;

  @Column('varchar')
  place: string;

  @Column('varchar')
  address: string;

  @Column('varchar')
  imgDir: string;

  @Column('tinyint', { default: false })
  isPin: boolean;

  @Column('tinyint')
  isPublic: boolean;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.stories, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
