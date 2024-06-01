import { Injectable } from '@nestjs/common';
import { StoryEntity } from 'src/entities/story.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateStoryDto } from './dto/create-story.dto';

@Injectable()
export class StoryRepository extends Repository<StoryEntity> {
  constructor(dataSource: DataSource) {
    super(StoryEntity, dataSource.createEntityManager());
  }

  async createStory(createStoryDto: CreateStoryDto): Promise<StoryEntity> {
    const story = this.create(createStoryDto);
    return await this.save(story);
  }
}
