import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SetProfileRequestDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: '본명' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '국적' })
  country: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '모교' })
  homeUniversity: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '전공' })
  major: string;
}

export class SetExchangeDayReqeustDto {
  @IsNotEmpty()
  @IsDate()
  @ApiProperty({ description: '교환학생 시작 날짜', example: 'yyyy-mm-dd' })
  startDay: Date;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({ description: '교환학생 끝 날짜', example: 'yyyy-mm-dd' })
  endDay: Date;
}
