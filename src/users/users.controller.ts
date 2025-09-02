import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role, User } from '@prisma/client';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isEmailConfirmed: user.isEmailConfirmed,
      createdAt: user.createdAt,
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get('admin-only')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async adminOnlyRoute() {
    return {
      message: 'Это роут только для администраторов',
      timestamp: new Date().toISOString(),
    };
  }
}
