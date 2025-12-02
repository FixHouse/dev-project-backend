import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Створення користувача по email
  async create(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.READER, // стартує як читач
      },
    });
  }

  // Створення користувача по телефону
  async createByPhone(phone: string, password: string, phoneCountry?: string) {
    return this.prisma.user.create({
      data: {
        phone,
        phoneCountry,
        password,
        role: Role.READER,
      },
    });
  }

  // Пошук по email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Пошук по телефону
  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  // Пошук по id
  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // Зробити користувача автором
  async becomeAuthor(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { role: Role.AUTHOR },
    });
  }

  // Публічний профіль (для себе або іншого користувача)
  async getPublicProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        avatarUrl: true,
        city: true,
        bio: true,
        website: true,
        instagram: true,
        telegram: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Оновлення профілю поточного користувача
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        avatarUrl: true,
        city: true,
        bio: true,
        website: true,
        instagram: true,
        telegram: true,
        createdAt: true,
      },
    });

    return updated;
  }
}

