import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';  // ⬅ додаємо

@Module({
  imports: [PrismaModule],                           // ⬅ додаємо
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
