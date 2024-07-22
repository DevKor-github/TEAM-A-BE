import { ApiProperty } from '@nestjs/swagger';

export class UpdateCalendarDataResponseDto {
  @ApiProperty({ description: '업데이트 여부' })
  updated: boolean;

  constructor(updated: boolean) {
    this.updated = updated;
  }
}
