import { GetStoryResponseDto } from './get-story.dto';

export class GetFeedResponseDto extends GetStoryResponseDto {
  user: {
    id: number;

    username: string;

    name: string;

    homeUniversity: string;

    major: string;
  };
}
