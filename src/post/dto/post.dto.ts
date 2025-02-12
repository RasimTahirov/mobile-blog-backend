import { IsString } from 'class-validator';

export class PostDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  image: string;
}
