import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { S3Service } from 'src/s3/s3.service';
import { User } from 'src/user/common/entities/user.entity';
import { Like } from './entities/like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Like])],
  controllers: [PostController],
  providers: [PostService, S3Service],
})
export class PostModule {}
