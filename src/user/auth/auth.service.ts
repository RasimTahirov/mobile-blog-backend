import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../common/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../common/dto/register.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const userByEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    const userByName = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (userByEmail)
      throw new ConflictException('Пользователь с данным email уже существует');

    if (userByName)
      throw new ConflictException('Пользователь с данным именем уже существет');

    const userData = this.userRepository.create({
      ...dto,
      password: await argon2.hash(dto.password),
    });

    return await this.userRepository.save(userData);
  }
}
