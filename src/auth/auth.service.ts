import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create(dto.email, hashed);

    const token = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
