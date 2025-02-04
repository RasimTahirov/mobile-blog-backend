import { MaxLength, MinLength } from 'class-validator';
import { Post } from 'src/post/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  @MaxLength(30)
  @MinLength(2)
  name: string;

  @Column({ type: 'varchar', length: 30 })
  @MaxLength(30)
  @MinLength(2)
  surname: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column()
  @MinLength(6)
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
