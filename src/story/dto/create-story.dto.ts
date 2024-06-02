import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateStoryRequestDto {
  @IsNotEmpty()
  @IsString()
  place: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean;
}

export class CreateStoryResponseDto {
  constructor(created: boolean) {
    this.created = created;
  }

  created: boolean;
}

export class CreateStoryDto extends CreateStoryRequestDto {
  userId: number;

  imgDir: string;
}
