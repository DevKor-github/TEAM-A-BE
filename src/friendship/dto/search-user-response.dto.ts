import { IsOptional, IsString } from 'class-validator';

export class SearchUserResponseDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  major: string;

  @IsString()
  @IsOptional()
  language: string;
}