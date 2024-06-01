import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly mode: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get('AWS_BUCKET_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      },
    });
    this.bucketName = this.configService.get('AWS_BUCKET_NAME');
    this.mode = process.env.NODE_ENV;
  }

  async uploadFile(
    file: Express.Multer.File,
    resource: string,
    path: string,
  ): Promise<string> {
    const splitedFileNames = file.originalname.split('.');
    const extension = splitedFileNames.at(splitedFileNames.length - 1);
    const filename = `${this.mode}/${resource}/${path}/${new Date().getTime()}.${extension}`;
    const params = {
      Key: filename,
      Body: file.buffer,
      Bucket: this.bucketName,
    };
    const command = new PutObjectCommand(params);

    const uploadFile = await this.s3.send(command);

    if (uploadFile.$metadata.httpStatusCode !== 200) {
      throw new BadRequestException('Failed upload file');
    }

    return filename;
  }

  async deleteFile(filename: string): Promise<void> {
    const params = {
      Key: filename,
      Bucket: this.bucketName,
    };
    console.log(params);
    const command = new DeleteObjectCommand(params);

    const deleteFile = await this.s3.send(command);
    console.log(deleteFile);

    if (deleteFile.$metadata.httpStatusCode !== 204) {
      throw new BadRequestException('Failed delete file');
    }
  }
}
