import { Injectable, NotImplementedException } from '@nestjs/common';
import { StoryRepository } from './story.repository';
import {
  CreateStoryRequestDto,
  CreateStoryResponseDto,
} from './dto/create-story.dto';
import { FileService } from 'src/common/file.service';

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
}
