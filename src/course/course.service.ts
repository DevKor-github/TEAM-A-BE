import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseRepository } from './course.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { CourseEntity } from 'src/entities/course.entity';
import { CreateCourseDetailDto } from './dto/create-course-detail.dto';
import { CourseDetailEntity } from 'src/entities/course-detail.entity';
import { CourseDetailRepository } from './course-detail.repository';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseDetailDto } from './dto/update-course-detail.dto';
import { Like } from 'typeorm';
import { SearchCourseDto } from './dto/search-course.dto';
import { CommonCourseResponseDto } from './dto/common-course-response.dto';
import { CommonCourseDetailResponseDto } from './dto/common-course-detail-response.dto';

@Injectable()
export class CourseService {
  constructor(
    private courseRepository: CourseRepository,
    private courseDetailRepository: CourseDetailRepository,
  ) {}

  async createCourse(
    createCourseDto: CreateCourseDto,
  ): Promise<CommonCourseResponseDto> {
    return await this.courseRepository.createCourse(createCourseDto);
  }

  async createCourseDetail(
    createCourseDetailDto: CreateCourseDetailDto,
  ): Promise<CommonCourseDetailResponseDto> {
    try {
      // Check if course exists
      await this.courseRepository.findOne({
        where: { id: createCourseDetailDto.courseId },
      });
      return await this.courseDetailRepository.createCourseDetail(
        createCourseDetailDto,
      );
    } catch (error) {
      throw new NotFoundException(
        `Course with id ${createCourseDetailDto.courseId} not found`,
      );
    }
  }

  async getAllCourses(): Promise<CommonCourseResponseDto[]> {
    return await this.courseRepository.find();
  }

  async getCourse(courseId: number): Promise<CommonCourseResponseDto> {
    return await this.courseRepository.findOne({
      where: { id: courseId },
    });
  }

  async getCourseWithCourseDetails(courseId: number): Promise<CourseEntity> {
    return await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['courseDetails'],
    });
  }

  async getCourseDetails(courseId: number): Promise<CourseDetailEntity[]> {
    return await this.courseDetailRepository.find({
      where: { courseId: courseId },
    });
  }

  // 학수번호 검색
  async searchCourseCode(
    searchCourseDto: SearchCourseDto,
  ): Promise<CommonCourseResponseDto[]> {
    return await this.courseRepository.find({
      where: { courseCode: searchCourseDto.courseCode },
    });
  }

  // 과목명 검색 (띄어쓰기로 단어 구분)
  async searchCourseName(
    major: string,
    searchCourseDto: SearchCourseDto,
  ): Promise<CommonCourseResponseDto[]> {
    const words = searchCourseDto.courseName
      .split(/\s+/)
      .filter((word) => word.length);
    const searchPattern = words.map((word) => `(?=.*\\b${word}\\b)`).join('');
    return await this.courseRepository
      .createQueryBuilder('course')
      .where(`course.courseName REGEXP :pattern`, {
        pattern: `^${searchPattern}.*$`,
      })
      .andWhere('course.major = :major', { major })
      .getMany();
  }

  // 교수님 성함 검색
  async searchProfessorName(
    major: string,
    searchCourseDto: SearchCourseDto,
  ): Promise<CommonCourseResponseDto[]> {
    return await this.courseRepository.find({
      where: {
        professorName: Like(`%${searchCourseDto.professorName}%`),
        major: major,
      },
    });
  }

  // 교양 리스트 반환
  async getGeneralCourses(): Promise<CommonCourseResponseDto[]> {
    return await this.courseRepository.find({
      where: { category: 'General Studies' },
    });
  }

  // 전공 리스트 반환
  async getMajorCourses(major: string): Promise<CommonCourseResponseDto[]> {
    if (!major) throw new BadRequestException('Major is required!');
    return await this.courseRepository.find({
      where: { category: 'Major', major: major },
    });
  }

  // 학문의 기초 리스트 반환
  async getAcademicFoundationCourses(
    college: string,
  ): Promise<CommonCourseResponseDto[]> {
    if (!college) throw new BadRequestException('College is required!');
    return await this.courseRepository.find({
      where: { category: 'Academic Foundations', college: college },
    });
  }

  async updateCourseDetail(
    updateCourseDetailDto: UpdateCourseDetailDto,
    courseDetailId: number,
  ): Promise<CommonCourseDetailResponseDto> {
    return await this.courseDetailRepository.updateCourseDetail(
      updateCourseDetailDto,
      courseDetailId,
    );
  }

  async updateCourse(
    updateCourseDto: UpdateCourseDto,
    courseId: number,
  ): Promise<CommonCourseResponseDto> {
    return await this.courseRepository.updateCourse(updateCourseDto, courseId);
  }
}
