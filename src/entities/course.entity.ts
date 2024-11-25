import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from './common.entity';
import { CourseDetailEntity } from './course-detail.entity';
import { TimetableCourseEntity } from './timetable-course.entity';

@Entity('course')
@Index('ngram_index', ['courseName', 'professorName', 'courseCode'], {
  fulltext: true,
  parser: 'ngram',
})
export class CourseEntity extends CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column('varchar', { nullable: false })
  professorName: string;

  @Column('varchar', { nullable: false })
  category: string;

  @Column('varchar', { nullable: true })
  college: string;

  @Column('varchar', { nullable: false })
  courseName: string;

  @Column('varchar', { nullable: false })
  courseCode: string;

  @Column('int', { nullable: false })
  credit: number;

  @Column('varchar', { nullable: true })
  major: string;

  @Column('boolean', { nullable: false })
  hasExchangeSeat: boolean;

  @Column('varchar', { nullable: false })
  year: string;

  @Column('varchar', { nullable: false })
  semester: string;

  @Column('varchar', { nullable: false })
  syllabus: string;

  @Column('float', { nullable: false, default: 0.0 })
  totalRate: number;

  @OneToMany(
    () => CourseDetailEntity,
    (courseDetailEntity) => courseDetailEntity.course,
  )
  courseDetails: CourseDetailEntity[];

  @OneToMany(
    () => TimetableCourseEntity,
    (timetableCourseEntity) => timetableCourseEntity.course,
  )
  timetableCourses: TimetableCourseEntity[];
}
