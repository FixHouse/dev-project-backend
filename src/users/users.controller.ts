import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: { email: string; password: string }) {
    return this.usersService.create(body.email, body.password);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }

  @Patch(':id/become-author')
  becomeAuthor(@Param('id') id: string) {
    return this.usersService.becomeAuthor(Number(id));
  }
}
