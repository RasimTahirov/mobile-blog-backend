import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../common/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../common/dto/register.dto';
import { LoginDto } from '../common/dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { S3Service } from 'src/s3/s3.service';
import { generateUrl } from 'src/s3/common/utils/generateUrl';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly s3: S3Service,
  ) {}

  async register(dto: RegisterDto) {
    const userByEmail = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    const userName = await this.userRepository.findOne({
      where: {
        name: dto.name,
        surname: dto.surname,
      },
    });

    if (userByEmail) throw new ConflictException('Пользователь с данным email уже существует');

    if (userName)
      throw new ConflictException('Пользователь с таким именем и фамилией уже существует');

    const userData = this.userRepository.create({
      ...dto,
      nickname: '@' + (dto.name + dto.surname).toLowerCase(),
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

    return { token, user };
  }

  async getUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    return user;
  }

  async avatar(avatar: Express.Multer.File, id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) throw new BadRequestException('Пользователь не найден');

    const { buffer, mimetype, originalname } = avatar;
    const name = generateUrl(originalname);

    const url = this.configService.getOrThrow<string>('S3_URL') + `${name}`;

    await this.s3.uploadFile(buffer, name, mimetype);

    user.avatar = url;

    await this.userRepository.save(user);

    return { user };
  }
}
