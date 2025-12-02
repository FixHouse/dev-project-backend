import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterPhoneDto } from './dto/register-phone.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // ЛОГІН: email АБО телефон
  async login(dto: LoginDto) {
    const { identifier, password } = dto;

    let user;

    if (identifier.includes('@')) {
      // логін по email
      user = await this.usersService.findByEmail(identifier);
    } else {
      // логін по телефону
      const phoneNumber = parsePhoneNumberFromString(identifier);

      if (!phoneNumber || !phoneNumber.isValid()) {
        throw new BadRequestException('Invalid phone number');
      }

      const e164 = phoneNumber.number; // +380...
      user = await this.usersService.findByPhone(e164);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { password: _pwd, ...safeUser } = user;

    return {
      accessToken,
      user: safeUser,
    };
  }

  // РЕЄСТРАЦІЯ ПО ТЕЛЕФОНУ
  async registerByPhone(dto: RegisterPhoneDto) {
    const phoneNumber = parsePhoneNumberFromString(dto.phone);

    if (!phoneNumber || !phoneNumber.isValid()) {
      throw new BadRequestException('Invalid phone number');
    }

    const e164 = phoneNumber.number; // +380...
    const country = phoneNumber.country; // UA, US, etc.

    const existing = await this.usersService.findByPhone(e164);
    if (existing) {
      throw new BadRequestException('Phone already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createByPhone(
      e164,
      hashedPassword,
      country,
    );

    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const { password: _pwd, ...safeUser } = user;

    return {
      accessToken,
      user: safeUser,
    };
  }
}

