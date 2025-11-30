import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: { email: string; password: string }) {
    return this.usersService.create(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return req.user; // повертаємо користувача з токена
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.READER) // дозволяємо ТІЛЬКИ READER
  @Patch('me/become-author')
  becomeAuthor(@Req() req) {
    return this.usersService.becomeAuthor(req.user.id);
  }
}
