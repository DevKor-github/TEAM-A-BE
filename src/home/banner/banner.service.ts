import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileService } from 'src/common/file.service';
import { BannerEntity } from 'src/entities/banner.entity';
import { Repository } from 'typeorm';
import { bannerDto } from './dto/banner.dto';
import { throwKukeyException } from 'src/utils/exception.util';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(BannerEntity)
    private readonly bannerRepository: Repository<BannerEntity>,
    private readonly fileService: FileService,
  ) {}

  async getBannerImages(): Promise<bannerDto[]> {
    const banners = await this.bannerRepository.find({
      order: { createdAt: 'DESC' },
    });
    return banners.map((banner) => {
      return {
        id: banner.id,
        imageUrl: banner.imageUrl,
        title: banner.title,
      };
    });
  }

  async createBannerImage(
    image: Express.Multer.File,
    title: string,
  ): Promise<bannerDto> {
    if (!image) {
      throwKukeyException('BANNER_IMAGE_REQUIRED');
    }
    if (!this.fileService.imagefilter(image)) {
      throwKukeyException('NOT_IMAGE_FILE');
    }
    const fileDir = await this.fileService.uploadFile(image, 'home', 'banner');
    const imageUrl = this.fileService.makeUrlByFileDir(fileDir);
    const banner = this.bannerRepository.create({
      imageUrl,
      title,
    });
    const savedBanner = await this.bannerRepository.save(banner);
    return {
      id: savedBanner.id,
      imageUrl: savedBanner.imageUrl,
      title: savedBanner.title,
    };
  }

  async deleteBannerImage(id: number): Promise<void> {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throwKukeyException('BANNER_NOT_FOUND');
    }
    const deleted = await this.bannerRepository.softDelete({ id });
    if (deleted.affected === 0) {
      throwKukeyException('BANNER_DELETE_FAILED');
    }
    const fileDir = this.fileService.getFileDirFromUrl(banner.imageUrl);
    await this.fileService.deleteFile(fileDir);
  }
}
