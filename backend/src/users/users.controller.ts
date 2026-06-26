import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  @Post()
  createUser(@Body() data: Prisma.UserCreateInput) {
    return this.usersService.createUser(data);
  }
}
