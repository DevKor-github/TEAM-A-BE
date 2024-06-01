import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoryEntity } from 'src/entities/story.entity';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { StoryRepository } from './story.repository';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([StoryEntity]), CommonModule],
  controllers: [StoryController],
  providers: [StoryService, StoryRepository],
})
export class StoryModule {}
