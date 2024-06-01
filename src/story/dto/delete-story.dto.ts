export class DeleteStoryResponseDto {
  constructor(deleted: boolean) {
    this.deleted = deleted;
  }

  deleted: boolean;
}
