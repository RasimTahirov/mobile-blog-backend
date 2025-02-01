import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { generateUrl } from './common/utils/generateUrl';

@Controller('s3')
export class S3Controller {
  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const { buffer, mimetype, originalname } = file;

    const name = generateUrl(originalname);
    const uploadResult = await this.s3Service.uploadFile(buffer, name, mimetype);

    const url = this.configService.getOrThrow<string>('S3_URL') + `${name}`;

    return { uploadResult, url };
  }
}
