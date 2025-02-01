import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../common/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../common/strategy/jwt.strategy';
import { jwtConfig } from '../common/config/jwt.config';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.registerAsync(jwtConfig)],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
