import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { PostDto } from './dto/post.dto';
import { generateUrl } from 'src/s3/common/utils/generateUrl';
import { S3Service } from 'src/s3/s3.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly s3: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async createPost(dto: PostDto, image: Express.Multer.File, id: number) {
    const { buffer, mimetype, originalname } = image;

    const name = generateUrl(originalname);
    const url = this.configService.getOrThrow<string>('S3_URL') + `${name}`;

    await this.s3.uploadFile(buffer, name, mimetype);

    const post = this.postRepository.create({
      ...dto,
      user: { id },
      image: url,
    });

    await this.postRepository.save(post);

    return { post };
  }

  async getAllPost() {
    const post = this.postRepository.find();

    return post;
  }
}
