import { Injectable, NotImplementedException } from '@nestjs/common';
import { StoryRepository } from './story.repository';
import {
  CreateStoryRequestDto,
  CreateStoryResponseDto,
} from './dto/create-story.dto';
import { FileService } from 'src/common/file.service';
import { GetStoryResponseDto } from './dto/get-story.dto';

@Injectable()
export class StoryService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly fileService: FileService,
  ) {}

  async createStory(
    userId: number,
    createStoryDto: CreateStoryRequestDto,
    storyImg: Express.Multer.File,
  ): Promise<CreateStoryResponseDto> {
    const imgDir = await this.fileService.uploadFile(
      storyImg,
      'Story',
      'cardImage',
    );

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

  async getStories(userId: number): Promise<GetStoryResponseDto[]> {
    const stories = await this.storyRepository.getStories(userId);
    const results = stories
      .sort((a, b) => b.storyDate.getTime() - a.storyDate.getTime())
      .map((story) => {
        const result = {
          id: story.id,
          storyDate: story.storyDate,
          imgDir:
            'https://kukey.s3.ap-northeast-2.amazonaws.com/' + story.imgDir,
          isPin: story.isPin,
        };

        return result;
      });

    return results;
  }

  async toggleStoryPin(
    userId: number,
    storyId: number,
  ): Promise<GetStoryResponseDto> {
    const story = await this.storyRepository.toggleStoryPin(userId, storyId);
    const result = {
      id: story.id,
      storyDate: story.storyDate,
      imgDir: 'https://kukey.s3.ap-northeast-2.amazonaws.com/' + story.imgDir,
      isPin: story.isPin,
    };

    return result;
  }
}
