import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, password: string) {
    return this.prisma.user.create({
      data: {
        email,
        password,
        role: Role.READER, // стартує як читач
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async becomeAuthor(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { role: Role.AUTHOR },
    });
  }
}
