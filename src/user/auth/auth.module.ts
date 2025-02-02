import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../common/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../common/strategy/jwt.strategy';
import { jwtConfig } from '../common/config/jwt.config';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.registerAsync(jwtConfig)],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, S3Service],
})
export class AuthModule {}
