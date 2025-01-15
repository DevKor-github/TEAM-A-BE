import { ApiProperty } from '@nestjs/swagger';

export class bannerDto {
  @ApiProperty({ description: '배너 id' })
  id: number;

  @ApiProperty({ description: '배너 이미지 URL' })
  imageUrl: string;

  @ApiProperty({ description: '배너 제목' })
  title: string;
}
