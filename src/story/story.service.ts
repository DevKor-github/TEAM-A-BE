import { Injectable, NotImplementedException } from '@nestjs/common';
import { StoryRepository } from './story.repository';
import {
  CreateStoryRequestDto,
  CreateStoryResponseDto,
} from './dto/create-story.dto';

@Injectable()
export class StoryService {
  constructor(private readonly storyRepository: StoryRepository) {}

  async createStory(
    userId: number,
    createStoryDto: CreateStoryRequestDto,
  ): Promise<CreateStoryResponseDto> {
    //파일 저장 코드 필요
    const imgDir = '/';

    const story = await this.storyRepository.createStory({
      ...createStoryDto,
      userId: userId,
      imgDir: imgDir,
    });
    if (!story) {
      throw new NotImplementedException('Create story failed!');
    }

    return new CreateStoryResponseDto(true);
  }
}
