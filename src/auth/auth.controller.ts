import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterPhoneDto } from './dto/register-phone.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register-phone')
  async registerByPhone(@Body() dto: RegisterPhoneDto) {
    return this.authService.registerByPhone(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterEmailDto) {
    return this.authService.registerEmail(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return req.user;
  }

  // ------------------ REFRESH / LOGOUT ------------------

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Body() dto: LogoutDto) {
    return this.authService.logout(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@Req() req) {
    return this.authService.logoutAll(req.user.id);
  }
}
