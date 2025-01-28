import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../common/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../common/dto/register.dto';
import { LoginDto } from '../common/dto/login.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
      throw new ConflictException(
        'Пользователь с данным именем уже существует',
      );

    const userData = this.userRepository.create({
      ...dto,
      password: await argon2.hash(dto.password),
    });

    return await this.userRepository.save(userData);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Неверный логин или пароль');

    const password = await argon2.verify(user.password, dto.password);

    if (!password) throw new UnauthorizedException('Неверный логин или пароль');

    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { token };
  }
}
