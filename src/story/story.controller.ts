import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
  ): Promise<GetStoryResponseDto[]> {
    return await this.storyService.getStories(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:storyId')
  async toggleStoryPin(
    @User() user: AuthorizedUserDto,
    @Param('storyId') storyId: number,
  ): Promise<GetStoryResponseDto> {
    return await this.storyService.toggleStoryPin(user.id, storyId);
  }
}
