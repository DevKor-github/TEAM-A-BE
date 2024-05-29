import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { UserEntity } from './user.entity';
import { TimeTableCourseEntity } from './timetable-course.entity';

@Entity('time_table')
export class TimeTableEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  userId: number;

  @Column('varchar', { nullable: false })
  tableName: string;

  @Column('varchar', { nullable: false })
  semester: string;

  @Column('varchar', { nullable: false })
  year: string;

  @Column('tinyint', { nullable: false, default: false })
  mainTimeTable: boolean;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.timeTables, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @OneToMany(
    () => TimeTableCourseEntity,
    (timeTableCourseEntity) => timeTableCourseEntity.timeTable,
  )
  timeTableCourses: TimeTableCourseEntity[];
}