import { IsString } from 'class-validator';
import { User } from 'src/user/common/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Like } from './like.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  @IsString()
  title: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  description: string;

  @Column()
  image: string;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @OneToMany(() => Like, (likes) => likes.post)
  likes: Like[];

  @CreateDateColumn()
  createdAt: Date;
}
