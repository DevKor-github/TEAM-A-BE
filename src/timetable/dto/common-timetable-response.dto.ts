import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CommonTimetableResponseDto {
  @ApiProperty({ description: 'ID' })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: '유저 ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: '시간표 이름' })
  @IsString()
  @IsNotEmpty()
  timetableName: string;

  @ApiProperty({ description: '학기' })
  @IsString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({ description: '연도' })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiProperty({ description: '대표 시간표 여부' })
  @IsBoolean()
  @IsNotEmpty()
  mainTimetable: boolean;

  @ApiProperty({ description: '시간표 색상' })
  @IsString()
  @IsNotEmpty()
  color: string;
}
