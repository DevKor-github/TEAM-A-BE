import { GetStoryResponseDto } from './get-story.dto';

export class GetFriendStoriesResponseDto {
  user: {
    id: number;
    name: string;
    username: string;
    language: string;
    country: string;
    homeUniversity: string;
    major: string;
  };
  stories: GetStoryResponseDto[];
}
