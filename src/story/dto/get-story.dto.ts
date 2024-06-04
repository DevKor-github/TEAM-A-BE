import { StoryEntity } from 'src/entities/story.entity';

export class GetStoryResponseDto {
  constructor(story: StoryEntity) {
    this.id = story.id;
    this.imgDir =
      'https://kukey.s3.ap-northeast-2.amazonaws.com/' + story.imgDir;
    this.date = story.createdAt;
    this.place = story.place;
    this.address = story.address;
    this.isPin = story.isPin;
  }

  id: number;

  imgDir: string;

  date: Date;

  place: string;

  address: string;

  isPin: boolean;
}
