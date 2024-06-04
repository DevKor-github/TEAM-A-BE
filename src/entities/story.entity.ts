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

  @Column('varchar', { nullable: false })
  place: string;

  @Column('varchar', { nullable: false })
  address: string;

  @Column('varchar', { nullable: false })
  imgDir: string;

  @Column('boolean', { default: false })
  isPin: boolean;

  @Column('boolean', { nullable: false })
  isPublic: boolean;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.stories, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
