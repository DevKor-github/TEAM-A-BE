import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import { CreateCourseReviewRequestDto } from './dto/create-course-review-request.dto';
import { CourseReviewResponseDto } from './dto/course-review-response.dto';
import { CourseReviewRepository } from './course-review.repository';
import { GetCourseReviewsRequestDto } from './dto/get-course-reviews-request.dto';
import { UserService } from 'src/user/user.service';
import { GetCourseReviewsResponseDto } from './dto/get-course-reviews-response.dto';
import { GetCourseReviewSummaryResponseDto } from './dto/get-course-review-summary-response.dto';
import { DataSource } from 'typeorm';
import { CourseReviewRecommendEntity } from 'src/entities/course-review-recommend.entity';
import { CourseReviewEntity } from 'src/entities/course-review.entity';
import { CourseReviewsFilterDto } from './dto/course-reviews-filter.dto';

@Injectable()
export class CourseReviewService {
  constructor(
    private readonly courseReviewRepository: CourseReviewRepository,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async createCourseReview(
    user: AuthorizedUserDto,
    createCourseReviewRequestDto: CreateCourseReviewRequestDto,
  ): Promise<CourseReviewResponseDto> {
    // 유저가 이미 강의평을 등록했는 지 체크
    const isAlreadReviewed = await this.courseReviewRepository.findOne({
      where: {
        userId: user.id,
        courseCode: createCourseReviewRequestDto.courseCode,
        professorName: createCourseReviewRequestDto.professorName,
      },
    });
    if (isAlreadReviewed) {
      throw new ConflictException(
        '이미 해당 강의에 대한 강의평을 등록했습니다.',
      );
    }

    const courseReview = this.courseReviewRepository.create({
      ...createCourseReviewRequestDto,
      userId: user.id,
    });

    return await this.courseReviewRepository.save(courseReview);
  }

  async getCourseReviewSummary(
    user: AuthorizedUserDto,
    getCourseReviewsRequestDto: GetCourseReviewsRequestDto,
  ): Promise<GetCourseReviewSummaryResponseDto> {
    const courseReviews = await this.courseReviewRepository.find({
      where: {
        courseCode: getCourseReviewsRequestDto.courseCode,
        professorName: getCourseReviewsRequestDto.professorName,
      },
    });

    if (courseReviews.length === 0) {
      // 강의평이 하나도 없으면
      return {
        totalRate: 0.0,
        reviewCount: 0,
        classLevel: 0,
        teamProject: 0,
        amountLearned: 0,
        teachingSkills: 0,
        attendance: 0,
      };
    }
    const reviewCount = courseReviews.length;
    const totalRate =
      courseReviews.reduce((sum, review) => sum + review.rate, 0) / reviewCount;
    const totalClassLevel =
      courseReviews.reduce((sum, review) => sum + review.classLevel, 0) /
      reviewCount;
    const totalTeamProject =
      courseReviews.reduce((sum, review) => sum + review.teamProject, 0) /
      reviewCount;
    const totalAmountLearned =
      courseReviews.reduce((sum, review) => sum + review.amountLearned, 0) /
      reviewCount;
    const totalTeachingSkills =
      courseReviews.reduce((sum, review) => sum + review.teachingSkills, 0) /
      reviewCount;
    const totalAttendance =
      courseReviews.reduce((sum, review) => sum + review.attendance, 0) /
      reviewCount;

    return {
      totalRate: parseFloat(totalRate.toFixed(1)),
      reviewCount,
      classLevel: parseFloat(totalClassLevel.toFixed(0)),
      teamProject: parseFloat(totalTeamProject.toFixed(0)),
      amountLearned: parseFloat(totalAmountLearned.toFixed(0)),
      teachingSkills: parseFloat(totalTeachingSkills.toFixed(0)),
      attendance: parseFloat(totalAttendance.toFixed(0)),
    };
  }

  async getMyCourseReviews(
    user: AuthorizedUserDto,
  ): Promise<CourseReviewResponseDto[]> {
    const courseReviews = await this.courseReviewRepository.find({
      where: { userId: user.id },
    });

    return courseReviews;
  }

  async getCourseReviews(
    user: AuthorizedUserDto,
    getCourseReviewsRequestDto: GetCourseReviewsRequestDto,
    courseReviewsFilterDto: CourseReviewsFilterDto,
  ): Promise<GetCourseReviewsResponseDto | []> {
    // 해당 과목의 강의평들 조회 (유저가 열람권 구매 안했으면 열람 불가 )
    const viewableUser = await this.userService.findUserById(user.id);
    if (!viewableUser.isViewable) {
      throw new ForbiddenException('열람권을 구매해야 합니다.');
    }

    const { criteria, direction } = courseReviewsFilterDto;

    const courseReviews = await this.courseReviewRepository.find({
      where: {
        courseCode: getCourseReviewsRequestDto.courseCode,
        professorName: getCourseReviewsRequestDto.professorName,
      },
      order: { [criteria]: direction },
    });

    if (courseReviews.length === 0) {
      return [];
    }

    const reviewCount = courseReviews.length;
    const totalRate =
      courseReviews.reduce((sum, review) => sum + review.rate, 0) / reviewCount;

    const reviews = courseReviews.map((courseReview) => ({
      id: courseReview.id,
      rate: courseReview.rate,
      year: courseReview.year,
      semester: courseReview.semester,
      recommended: courseReview.recommended,
      text: courseReview.textReview,
    }));

    return {
      totalRate: parseFloat(totalRate.toFixed(1)), // 소수점 이하 첫째자리까지 나타내기
      reviewCount,
      reviews,
    };
  }

  async toggleRecommendCourseReview(
    user: AuthorizedUserDto,
    courseReviewId: number,
  ): Promise<CourseReviewResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const courseReview = await this.courseReviewRepository.findOne({
        where: { id: courseReviewId },
      });

      if (!courseReview) {
        throw new NotFoundException('해당 강의평을 찾을 수 없습니다.');
      }

      // 이미 추천했는지 확인
      const isRecommended = await queryRunner.manager.findOne(
        CourseReviewRecommendEntity,
        {
          where: { userId: user.id, courseReviewId },
        },
      );

      // 이미 추천을 했을 때
      if (isRecommended) {
        await queryRunner.manager.delete(CourseReviewRecommendEntity, {
          userId: user.id,
          courseReviewId,
        });

        await queryRunner.manager.update(CourseReviewEntity, courseReviewId, {
          recommended: () => 'recommended - 1',
        });
        courseReview.recommended -= 1;
      } else {
        await queryRunner.manager.save(CourseReviewRecommendEntity, {
          userId: user.id,
          courseReviewId,
        });
        await queryRunner.manager.update(CourseReviewEntity, courseReviewId, {
          recommended: () => 'recommended + 1',
        });
        courseReview.recommended += 1;
      }
      await queryRunner.commitTransaction();
      return courseReview;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
