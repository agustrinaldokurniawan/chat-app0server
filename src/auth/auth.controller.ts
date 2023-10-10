import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  signIn(@Request() req) {
    return this.authService.signIn(req.user);
  }

  @Public()
  @Get('list-token')
  listToken() {
    return this.authService.listToken();
  }

  @Public()
  @Delete('delete-all-token')
  deleteAllToken() {
    return this.authService.deleteAllToken();
  }

  @Public()
  @Delete('delete-token/:email')
  deleteToken(@Param() params: any) {
    return this.authService.deleteTokenByUser(params.email);
  }
}
