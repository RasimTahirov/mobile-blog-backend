import { Injectable } from '@nestjs/common';
import { PutObjectCommand, PutObjectCommandInput, S3 } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly s3: S3;
  private readonly containerName: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      region: this.configService.getOrThrow<string>('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow<string>('S3_SECRET_KEY'),
      },
      endpoint: (this.endpoint = this.configService.getOrThrow<string>('S3_ENDPOINT')),
      forcePathStyle: true,
    });

    this.containerName = this.configService.getOrThrow<string>('S3_NAME_CONTAINER');
  }

  async uploadFile(buffer: Buffer, key: string, mimetype: string) {
    const command: PutObjectCommandInput = {
      Bucket: this.containerName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    };

    try {
      return await this.s3.send(new PutObjectCommand(command));
    } catch (error) {
      throw error;
    }
  }
}
