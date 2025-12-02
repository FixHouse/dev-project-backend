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
import { LoginDto } from './dto/login.dto';
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


  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    // req.user приходить з JwtStrategy.validate(...)
    return req.user;
  }
}
