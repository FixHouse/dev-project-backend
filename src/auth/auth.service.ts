import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterPhoneDto } from './dto/register-phone.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ======================== ЛОГІН: email АБО телефон ========================
  async login(dto: LoginDto) {
    const { identifier, password, deviceId } = dto;

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

    // генеруємо пару токенів
    const { accessToken, refreshToken } = await this.generateTokens(payload);

    // створюємо сесію для девайсу
    const safeDeviceId = deviceId || 'unknown-device';
    await this.createDeviceSession(user.id, refreshToken, safeDeviceId);

    const { password: _pwd, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }

  // ========================= РЕЄСТРАЦІЯ ЧЕРЕЗ EMAIL =========================
  async registerEmail(dto: RegisterEmailDto) {
    const { email, password } = dto;

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email is already in use');
    }

    const user = await this.usersService.create(email, password);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  // ========================= РЕЄСТРАЦІЯ ПО ТЕЛЕФОНУ =========================
  async registerByPhone(dto: RegisterPhoneDto) {
    const phoneNumber = parsePhoneNumberFromString(dto.phone);

    if (!phoneNumber || !phoneNumber.isValid()) {
      throw new BadRequestException('Invalid phone number');
    }

    const e164 = phoneNumber.number; // +380...
    const user = await this.usersService.createByPhone(
      e164,
      dto.password,
      dto.phoneCountry,
    );

    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
    };
  }

    // ============================= REFRESH TOKENS =============================
  async refreshTokens(dto: RefreshTokenDto) {
    const { refreshToken, deviceId } = dto;

    // 1. Валідуємо сам токен
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken as any, {
        secret:
          this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
      } as any);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 2. Знаходимо сесію
    const session = await this.prisma.deviceSession.findFirst({
      where: {
        userId: payload.sub,
        deviceId,
        revokedAt: null,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    // 3. Перевіряємо, що токен відповідає збереженому хешу
    const isMatch = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 4. Перевіряємо, що сесія не протухла
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    // 5. Дістаємо користувача
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }

    // 6. Генеруємо нову пару токенів
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    // 7. Оновлюємо refresh у DeviceSession
    const decoded = this.jwtService.decode(tokens.refreshToken) as {
      exp?: number;
    };
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : undefined;

    await this.prisma.deviceSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
        expiresAt: expiresAt ?? session.expiresAt,
      },
    });

    return tokens;
  }
  
  // ================================ LOGOUT ==================================
  async logout(userId: number, dto: LogoutDto) {
    await this.prisma.deviceSession.updateMany({
      where: {
        userId,
        deviceId: dto.deviceId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return { success: true };
  }

  async logoutAll(userId: number) {
    await this.prisma.deviceSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return { success: true };
  }

  // ============================ HELPER: токени ==============================
private async generateTokens(payload: {
  sub: number;
  email?: string | null;
  phone?: string | null;
  role: string;
}) {
  const accessToken = await this.jwtService.signAsync(
    payload as any,
    {
      secret:
        this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
      expiresIn:
        this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m',
    } as any,
  );

  const refreshToken = await this.jwtService.signAsync(
    { sub: payload.sub, role: payload.role } as any,
    {
      secret:
        this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
      expiresIn:
        this.config.get<string>('JWT_REFRESH_EXPIRES') ?? '30d',
    } as any,
  );

  return { accessToken, refreshToken };
}


  // ======================== HELPER: сесія девайса ===========================
  private async createDeviceSession(
    userId: number,
    refreshToken: string,
    deviceId: string,
  ) {
    const hash = await bcrypt.hash(refreshToken, 10);

    const decoded = this.jwtService.decode(refreshToken) as { exp?: number };
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;

    await this.prisma.deviceSession.create({
      data: {
        userId,
        deviceId,
        refreshTokenHash: hash,
        expiresAt:
          expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
