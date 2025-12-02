import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //  CТАРИЙ create (якщо реєстрація переїде в /auth/register — можна буде видалити)
  @Post()
  create(@Body() body: { email: string; password: string }) {
    return this.usersService.create(body.email, body.password);
  }

  //  Отримати дані з токена (як зараз)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return req.user; // те, що повертає JwtStrategy
  }

  //  Зробити користувача автором (доступно тільки READER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.READER) // дозволяємо ТІЛЬКИ READER
  @Patch('me/become-author')
  becomeAuthor(@Req() req: any) {
    return this.usersService.becomeAuthor(req.user.id);
  }

  //  ОТРИМАТИ СВІЙ ПРОФІЛЬ
  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  getMyProfile(@Req() req: any) {
    const userId = req.user.id;
    return this.usersService.getPublicProfile(userId);
  }

  //  ОНОВИТИ СВІЙ ПРОФІЛЬ
  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  updateMyProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
  ) {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, dto);
  }

  //  ПУБЛІЧНИЙ ПРОФІЛЬ ІНШОГО КОРИСТУВАЧА
  @Get(':id/profile')
  getUserProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(Number(id));
  }
}
