import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StoryService } from './story.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthorizedUserDto } from 'src/auth/dto/authorized-user-dto';
import {
  CreateStoryRequestDto,
  CreateStoryResponseDto,
} from './dto/create-story.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetStoryResponseDto } from './dto/get-story.dto';
import { DeleteStoryResponseDto } from './dto/delete-story.dto';
import { GetFeedResponseDto } from './dto/get-feed.dto';
import { GetFriendStoriesResponseDto } from './dto/get-friend-stories.dto';

@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('story'))
  @Post()
  async createStory(
    @User() user: AuthorizedUserDto,
    @Body() body: CreateStoryRequestDto,
    @UploadedFile() storyImg: Express.Multer.File,
  ): Promise<CreateStoryResponseDto> {
    if (!storyImg) {
      throw new BadRequestException('Story image should be uploaded!');
    }

    return await this.storyService.createStory(user.id, body, storyImg);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getStories(
    @User() user: AuthorizedUserDto,
    @Query('date') date?: string,
  ): Promise<GetStoryResponseDto[]> {
    return await this.storyService.getStories(user.id, date);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:storyId')
  async toggleStoryPin(
    @User() user: AuthorizedUserDto,
    @Param('storyId') storyId: number,
  ): Promise<GetStoryResponseDto> {
    return await this.storyService.toggleStoryPin(user.id, storyId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:storyId')
  async deleteStory(
    @User() user: AuthorizedUserDto,
    @Param('storyId') storyId: number,
  ): Promise<DeleteStoryResponseDto> {
    return await this.storyService.deleteStory(user.id, storyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/feed')
  async getFeed(
    @User() user: AuthorizedUserDto,
  ): Promise<GetFeedResponseDto[]> {
    return await this.storyService.getFeed(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/friend/:friendId')
  async getFriendStories(
    @User() user: AuthorizedUserDto,
    @Param('friendId') friendId: number,
  ): Promise<GetFriendStoriesResponseDto> {
    return await this.storyService.getFriendStories(user.id, friendId);
  }
}
