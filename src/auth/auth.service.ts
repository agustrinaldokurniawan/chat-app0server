import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private generateAccessToken(user: any): Promise<string> {
    const payload = { user_id: user._id, email: user.email, name: user.name };
    return this.jwtService.signAsync(payload);
  }

  private generateRefreshToken(user: any): Promise<string> {
    const payload = { user_id: user._id, email: user.email, name: user.name };
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (!user.email_verified.status)
      throw new UnauthorizedException({
        content: {
          message: 'Email is not verified',
        },
      });
    if (user.locked.status)
      throw new UnauthorizedException({
        content: {
          message: 'User account is locked',
          expired: user.locked.expiration,
        },
      });
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (isPasswordMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async signIn(user: any): Promise<any> {
    const access_token = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return {
      access_token,
      refreshToken,
    };
  }
}
