import {
  BadRequestException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { StoryRepository } from './story.repository';
import {
  CreateStoryRequestDto,
  CreateStoryResponseDto,
} from './dto/create-story.dto';
import { FileService } from 'src/common/file.service';
import { GetStoryResponseDto } from './dto/get-story.dto';
import { DeleteStoryResponseDto } from './dto/delete-story.dto';
import { FriendshipService } from 'src/friendship/friendship.service';
import { GetFeedResponseDto } from './dto/get-feed.dto';
import { StoryEntity } from 'src/entities/story.entity';

@Injectable()
export class StoryService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly fileService: FileService,
    private readonly friendshipService: FriendshipService,
  ) {}

  async createStory(
    userId: number,
    createStoryDto: CreateStoryRequestDto,
    storyImg: Express.Multer.File,
  ): Promise<CreateStoryResponseDto> {
    const today = new Date();
    today.setHours(today.getHours() + 9); //UTC -> 서울 시간

    const todayStories = (await this.storyRepository.getStories(userId)).filter(
      (story) => {
        const storyDate = story.createdAt;
        return (
          storyDate.getFullYear() === today.getFullYear() &&
          storyDate.getMonth() === today.getMonth() &&
          storyDate.getDate() === today.getDate()
        );
      },
    );

    if (todayStories.length >= 3) {
      throw new BadRequestException('Already 3 stories uploaded today!');
    }

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

  async getStories(
    userId: number,
    date?: string,
  ): Promise<GetStoryResponseDto[]> {
    let stories: StoryEntity[];
    if (date) {
      stories = await this.storyRepository.getStorieswithDate(
        userId,
        new Date(date),
      );
    } else {
      stories = await this.storyRepository.getStories(userId);
    }
    const results = stories
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((story) => {
        const result = {
          id: story.id,
          date: story.createdAt,
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
      date: story.createdAt,
      imgDir: 'https://kukey.s3.ap-northeast-2.amazonaws.com/' + story.imgDir,
      isPin: story.isPin,
    };

    return result;
  }

  async deleteStory(
    userId: number,
    storyId: number,
  ): Promise<DeleteStoryResponseDto> {
    const isDeleted = await this.storyRepository.deleteStory(userId, storyId);
    if (!isDeleted) {
      throw new NotImplementedException('Delete story failed!');
    }

    return new DeleteStoryResponseDto(true);
  }

  async getFeed(userId: number): Promise<GetFeedResponseDto[]> {
    const friendIds = (await this.friendshipService.getFriendList(userId)).map(
      (friend) => friend.userId,
    );
    const stories = await this.storyRepository.getFeed(friendIds);
    const results = stories
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((story) => {
        const result = {
          id: story.id,
          date: story.createdAt,
          imgDir:
            'https://kukey.s3.ap-northeast-2.amazonaws.com/' + story.imgDir,
          isPin: story.isPin,
          user: {
            id: story.user.id,
            username: story.user.username,
            name: story.user.name,
            homeUniversity: story.user.homeUniversity,
            major: story.user.major,
          },
        };
        return result;
      });

    return results;
  }
}
