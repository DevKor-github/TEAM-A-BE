import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { MethodNames } from 'src/common/types/method';
import { BannerController } from 'src/home/banner/banner.controller';
import { bannerDto } from 'src/home/banner/dto/banner.dto';
import { createBannerRequestDto } from 'src/home/banner/dto/createBannerRequest.dto';

type BannerEndPoints = MethodNames<BannerController>;

const BannerDocsMap: Record<BannerEndPoints, MethodDecorator[]> = {
  getBannerImages: [
    ApiOperation({
      summary: '배너 이미지 목록 조회',
      description: '배너 이미지 목록을 조회합니다.(최신순)',
    }),
    ApiResponse({
      status: 200,
      description: '배너 이미지 목록 조회 성공',
      isArray: true,
      type: bannerDto,
    }),
  ],
  createBannerImage: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '배너 이미지 생성',
      description: '배너 이미지를 생성합니다.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      type: createBannerRequestDto,
    }),
    ApiResponse({
      status: 201,
      description: '배너 이미지 생성 성공',
      type: bannerDto,
    }),
  ],
  deleteBannerImage: [
    ApiBearerAuth('accessToken'),
    ApiOperation({
      summary: '배너 이미지 삭제',
      description: '배너 이미지를 삭제합니다.',
    }),
    ApiParam({ name: 'id', required: true, description: '배너 이미지 id' }),
    ApiResponse({
      status: 200,
      description: '배너 이미지 삭제 성공',
    }),
  ],
};

export function BannerDocs(target: typeof BannerController) {
  for (const key in BannerDocsMap) {
    const methodDecorators = BannerDocsMap[key as BannerEndPoints];

    const descripter = Object.getOwnPropertyDescriptor(target.prototype, key);
    if (descripter) {
      for (const decorator of methodDecorators) {
        decorator(target.prototype, key, descripter);
      }
      Object.defineProperty(target.prototype, key, descripter);
    }
  }
  return target;
}
