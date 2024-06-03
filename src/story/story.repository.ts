import { BadRequestException, Injectable } from '@nestjs/common';
import { StoryEntity } from 'src/entities/story.entity';
import { Between, DataSource, In, Repository } from 'typeorm';
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

  async getStories(userId: number): Promise<StoryEntity[]> {
    const stories = await this.find({
      where: { userId: userId },
    });

    return stories;
  }

  async getStorieswithDate(userId: number, date: Date): Promise<StoryEntity[]> {
    const fromDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const toDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
    );
    const stories = await this.find({
      where: { userId: userId, createdAt: Between(fromDate, toDate) },
    });

    return stories;
  }

  async toggleStoryPin(userId: number, storyId: number): Promise<StoryEntity> {
    const story = await this.findOne({
      where: {
        id: storyId,
        userId: userId,
      },
    });
    if (!story) {
      throw new BadRequestException('Cannot find story!');
    }

    const toggledStory = {
      ...story,
      isPin: !story.isPin,
    };

    const result = await this.save(toggledStory);
    return result;
  }

  async deleteStory(userId: number, storyId: number): Promise<boolean> {
    const deleteResult = await this.softDelete({
      id: storyId,
      userId: userId,
    });
    return deleteResult.affected ? true : false;
  }

  async getFeed(friendIds: number[]): Promise<StoryEntity[]> {
    const today = new Date();
    today.setHours(today.getHours() + 9);
    const beforeOneDay = new Date();
    beforeOneDay.setHours(beforeOneDay.getHours() - 15);
    const stories = await this.find({
      where: [
        { userId: In(friendIds), isPin: true },
        {
          userId: In(friendIds),
          createdAt: Between(beforeOneDay, today),
        },
      ],
      relations: ['user'],
    });

    return stories;
  }
}
