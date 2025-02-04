import { IsString } from 'class-validator';
import { User } from 'src/user/common/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  @IsString()
  title: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  description: string;

  @Column()
  image: string;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;
}
