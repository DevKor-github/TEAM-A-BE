import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { bannerDto } from './dto/banner.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { BannerDocs } from 'src/decorators/docs/banner.decorator';
import { createBannerRequestDto } from 'src/home/banner/dto/createBannerRequest.dto';

@Controller('banner')
@ApiTags('banner')
@BannerDocs
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  async getBannerImages(): Promise<bannerDto[]> {
    return await this.bannerService.getBannerImages();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  async createBannerImage(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: createBannerRequestDto,
  ): Promise<bannerDto> {
    return await this.bannerService.createBannerImage(image, body.title);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete('/:id')
  async deleteBannerImage(@Param('id') id: number): Promise<void> {
    return await this.bannerService.deleteBannerImage(id);
  }
}
