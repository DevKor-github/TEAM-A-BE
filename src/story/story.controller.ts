import {
  BadRequestException,
  Body,
  Controller,
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

@Controller('story')
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('story'))
  @Post()
  async createStory(
    @User() user: AuthorizedUserDto,
    @Body() body: CreateStoryRequestDto,
    @UploadedFile() story: Express.Multer.File,
  ): Promise<CreateStoryResponseDto> {
    if (!story) {
      throw new BadRequestException('Story image should be uploaded!');
    }

    return await this.storyService.createStory(user.id, body);
  }
}
