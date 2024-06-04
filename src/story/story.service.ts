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
import { UserService } from 'src/user/user.service';
import { GetFriendStoriesResponseDto } from './dto/get-friend-stories.dto';

@Injectable()
export class StoryService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly fileService: FileService,
    private readonly friendshipService: FriendshipService,
    private readonly userService: UserService,
  ) {}

  async createStory(
    userId: number,
    createStoryDto: CreateStoryRequestDto,
    storyImg: Express.Multer.File,
  ): Promise<CreateStoryResponseDto> {
    const today = new Date();
    today.setHours(today.getHours() + 9); //UTC -> 서울 시간

    const todayStories = await this.storyRepository.getStorieswithDate(
      userId,
      today,
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
      .map((story) => new GetStoryResponseDto(story));

    return results;
  }

  async toggleStoryPin(
    userId: number,
    storyId: number,
  ): Promise<GetStoryResponseDto> {
    const story = await this.storyRepository.toggleStoryPin(userId, storyId);
    const result = new GetStoryResponseDto(story);

    return result;
  }

  async deleteStory(
    userId: number,
    storyId: number,
  ): Promise<DeleteStoryResponseDto> {
    const story = await this.storyRepository.findStoryById(storyId);
    if (story.userId !== userId) {
      throw new BadRequestException('Not your story!');
    }
    await this.fileService.deleteFile(story.imgDir);
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
        const result = new GetFeedResponseDto(story);
        result.user = {
          id: story.user.id,
          username: story.user.username,
          name: story.user.name,
          homeUniversity: story.user.homeUniversity,
          major: story.user.major,
        };
        return result;
      });

    return results;
  }

  async getFriendStories(
    userId: number,
    friendId: number,
  ): Promise<GetFriendStoriesResponseDto> {
    const friendIds = (await this.friendshipService.getFriendList(userId)).map(
      (friend) => Number(friend.userId),
    );
    if (!friendIds.includes(friendId)) {
      throw new BadRequestException('No friendship!');
    }
    const stories = await this.storyRepository.getPinnedStories(friendId);
    const user = await this.userService.findUserById(friendId);
    const results = {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        language: user.language,
        country: user.country,
        homeUniversity: user.homeUniversity,
        major: user.major,
      },
      stories: stories.map((story) => new GetStoryResponseDto(story)),
    };
    return results;
  }
}
