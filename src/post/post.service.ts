import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { PostDto } from './dto/post.dto';
import { generateUrl } from 'src/s3/common/utils/generateUrl';
import { S3Service } from 'src/s3/s3.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/common/entities/user.entity';
import { Like } from './entities/like.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
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
    const post = this.postRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });

    return post;
  }

  async addLike(postId: number, userId: number) {
    const { post, user } = await this.findPostAndUser(postId, userId);

    if (!post || !user) {
      throw new BadRequestException('Пост или пользователь не найден');
    }

    const isLike = await this.likeRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });

    if (isLike) {
      throw new ConflictException('Пользователь уже поставил лайк');
    }

    const like = this.likeRepository.create({
      post,
      user,
    });

    await this.likeRepository.save(like);

    return { messgae: 'Лайк поставилен' };
  }

  async removeLike(postId: number, userId: number) {
    const { post, user } = await this.findPostAndUser(postId, userId);

    if (!post || !user) {
      throw new BadRequestException('Пост или пользователь не найден');
    }

    const like = await this.likeRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });

    if (!like) throw new ConflictException('Лайк не найден');

    await this.likeRepository.delete(like.id);

    return { messgae: 'Лайк удален' };
  }

  async isLike(postId: number, userId: number) {
    const { post, user } = await this.findPostAndUser(postId, userId);

    if (!post || !user) {
      throw new BadRequestException('Пост или пользователь не найден');
    }

    const isLike = await this.likeRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
      },
    });

    return !!isLike;
  }

  private async findPostAndUser(postId: number, userId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!post || !user) {
      throw new BadRequestException('Пост или пользователь не найден');
    }

    return { post, user };
  }
}
