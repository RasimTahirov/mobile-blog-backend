import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostDto } from './dto/post.dto';
import { JwtAuthGuard } from 'src/user/common/guard/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async createPost(@Body() dto: PostDto, @UploadedFile() image: Express.Multer.File, @Req() req) {
    return await this.postService.createPost(dto, image, +req.user.id);
  }

  @Get('all')
  async getAllPost() {
    return await this.postService.getAllPost();
  }
}
