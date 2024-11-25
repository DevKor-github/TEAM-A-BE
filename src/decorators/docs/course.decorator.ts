import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { CourseController } from 'src/course/course.controller';
import { CommonCourseResponseDto } from 'src/course/dto/common-course-response.dto';
import { PaginatedCoursesDto } from 'src/course/dto/paginated-courses.dto';
import { ApiKukeyExceptionResponse } from '../api-kukey-exception-response';

type CourseEndPoints = MethodNames<CourseController>;

const CourseDocsMap: Record<CourseEndPoints, MethodDecorator[]> = {
  getAllCourseIndex: [],
  getAllCourse: [],
  searchCourseCode: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '학수번호로 강의 검색',
      description: '학수번호를 입력하여 강의를 검색합니다.',
    }),
    ApiQuery({
      name: 'courseCode',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'cursorId',
      required: false,
      type: 'number',
    }),
    ApiResponse({
      status: 200,
      description: '학수번호로 강의 검색 성공 시',
      type: PaginatedCoursesDto,
    }),
  ],
  searchMajorCourseName: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '전공 과목명 강의 검색',
      description: '전공 과목명을 입력하여 강의를 검색합니다.',
    }),
    ApiQuery({
      name: 'major',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'courseName',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'cursorId',
      required: false,
      type: 'number',
    }),
    ApiResponse({
      status: 200,
      description: '전공 과목명으로 강의 검색 성공 시',
      type: PaginatedCoursesDto,
    }),
    ApiKukeyExceptionResponse(['MAJOR_REQUIRED']),
  ],
  searchGeneralCourseName: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '교양 과목명 강의 검색',
      description: '교양 과목명을 입력하여 강의를 검색합니다.',
    }),
    ApiQuery({
      name: 'courseName',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'cursorId',
      required: false,
      type: 'number',
    }),
    ApiResponse({
      status: 200,
      description: '교양 과목명으로 강의 검색 성공 시',
      type: PaginatedCoursesDto,
    }),
  ],
  searchMajorProfessorName: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '전공 과목 담당 교수님 성함으로 강의 검색',
      description: '전공 과목 담당 교수님 성함을 입력하여 강의를 검색합니다.',
    }),
    ApiQuery({
      name: 'major',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'professorName',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'cursorId',
      required: false,
      type: 'number',
    }),
    ApiResponse({
      status: 200,
      description: '전공 과목 담당 교수님 성함으로 강의 검색 성공 시',
      type: PaginatedCoursesDto,
    }),
    ApiKukeyExceptionResponse(['MAJOR_REQUIRED']),
  ],
  searchGeneralProfessorName: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '교양 담당 교수님 성함으로 강의 검색',
      description: '교양 담당 교수님 성함을 입력하여 강의를 검색합니다.',
    }),
    ApiQuery({
      name: 'professorName',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'cursorId',
      required: false,
      type: 'number',
    }),
    ApiResponse({
      status: 200,
      description: '교양 담당 교수님 성함으로 강의 검색 성공 시',
      type: PaginatedCoursesDto,
    }),
  ],
  getGeneralCourses: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '교양 강의 조회',
      description: '모든 교양 강의를 조회합니다.',
    }),
    ApiQuery({
      name: 'cursorId',
      required: false,
      type: 'number',
    }),
    ApiResponse({
      status: 200,
      description: '교양 강의 조회 성공 시',
      type: PaginatedCoursesDto,
    }),
  ],
  getMajorCourses: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '전공 강의 조회',
      description: '해당 과의 모든 전공 강의를 조회합니다.',
    }),
    ApiQuery({
      name: 'major',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'cursorId',
      required: false,
      type: 'number',
    }),
    ApiResponse({
      status: 200,
      description: '전공 강의 조회 성공 시',
      type: PaginatedCoursesDto,
    }),
    ApiKukeyExceptionResponse(['MAJOR_REQUIRED']),
  ],
  getAcademicFoundationCourses: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '학문의 기초 강의 조회',
      description: '해당 단과대의 모든 학문의 기초 강의를 조회합니다.',
    }),
    ApiQuery({
      name: 'college',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'cursorId',
      required: false,
      type: 'number',
    }),
    ApiResponse({
      status: 200,
      description: '학문의 기초 강의 조회 성공 시',
      type: PaginatedCoursesDto,
    }),
    ApiKukeyExceptionResponse(['COLLEGE_REQUIRED']),
  ],
  getCourse: [
    ApiOperation({
      summary: '특정 강의 조회',
      description: '특정 강의를 조회합니다.',
    }),
    ApiParam({
      name: 'courseId',
      description: '특정 강의 ID',
    }),
    ApiResponse({
      status: 200,
      description: '특정 강의 조회 성공 시',
      type: CommonCourseResponseDto,
    }),
    ApiKukeyExceptionResponse(['COURSE_NOT_FOUND']),
  ],
};

export function CourseDocs(target: typeof CourseController) {
  for (const key in CourseDocsMap) {
    const methodDecorators = CourseDocsMap[key as keyof typeof CourseDocsMap];

    const descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
    if (descriptor) {
      for (const decorator of methodDecorators) {
        decorator(target.prototype, key, descriptor);
      }
      Object.defineProperty(target.prototype, key, descriptor);
    }
  }
  return target;
}
