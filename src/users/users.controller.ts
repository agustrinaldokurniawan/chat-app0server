import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUserDto';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VerificationEmailDto } from './dto/verificationEmailDto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signIn(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('verification-email')
  verificationEmail(@Body() verificationEmailDto: VerificationEmailDto) {
    return this.usersService.verificationEmail(verificationEmailDto);
  }

  @Public()
  @Delete('delete-user')
  deleteUser(@Body() body) {
    return this.usersService.deleteUser(body.email);
  }

  @Public()
  @Get('list-user')
  listUser() {
    return this.usersService.listUsers();
  }
}
