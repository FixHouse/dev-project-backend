import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
