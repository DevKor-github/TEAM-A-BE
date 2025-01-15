import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class createBannerRequestDto {
  @ApiProperty({
    description: '배너 이미지 파일',
    type: 'string',
    format: 'binary',
  })
  image: any;

  @ApiProperty({ description: '배너 제목' })
  @IsNotEmpty()
  title: string;
}
