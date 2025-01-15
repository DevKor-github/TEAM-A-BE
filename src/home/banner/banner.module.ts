import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerEntity } from 'src/entities/banner.entity';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BannerEntity]), CommonModule],
  providers: [BannerService, UserRepository],
  controllers: [BannerController],
})
export class BannerModule {}
