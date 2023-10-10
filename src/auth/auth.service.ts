import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as dayjs from 'dayjs';
import { InjectModel } from '@nestjs/mongoose';
import { AuthToken } from './schema/auth_token.schema';
import { Model } from 'mongoose';
import { AuthTokenEnum } from './enum/auth_token.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(AuthToken.name) private authTokenModel: Model<AuthToken>,
  ) {}

  private async generateAccessToken(user: any): Promise<string> {
    const payload = { user_id: user._id, email: user.email, name: user.name };
    const token = await this.jwtService.signAsync(payload);
    await this.authTokenModel.findOneAndUpdate(
      { user: user._id, type: AuthTokenEnum.ACCESS_TOKEN },
      { $set: { token } },
      { upsert: true, new: true },
    );
    return token;
  }

  private async generateRefreshToken(user: any): Promise<string> {
    const payload = { user_id: user._id, email: user.email, name: user.name };
    const token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
    await this.authTokenModel.findOneAndUpdate(
      { user: user._id, type: AuthTokenEnum.REFRESH_TOKEN },
      { $set: { token } },
      { upsert: true, new: true },
    );
    return token;
  }

  async validateToken(type: AuthTokenEnum, token: string): Promise<boolean> {
    const tokenDoc = await this.authTokenModel.findOne({ type, token });
    return !!tokenDoc?.token;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (!user.email_verified?.status)
      throw new UnauthorizedException({
        content: {
          message: 'Email is not verified',
        },
      });

    if (dayjs(user.try_login?.expired).isBefore(dayjs()))
      await this.usersService.resetTryLoginLimit(email);
    if (user.try_login?.locked) {
      throw new UnauthorizedException({
        content: {
          message: 'User account is locked',
          expired: user.try_login.expired,
        },
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (isPasswordMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...result } = user;
      return result;
    }
    await this.usersService.validateWrongPassword(email);
    return null;
  }

  async signIn(user: any): Promise<any> {
    await this.usersService.resetTryLoginLimit(user.email);
    const access_token = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return {
      access_token,
      refreshToken,
    };
  }

  async listToken(): Promise<AuthToken[]> {
    return this.authTokenModel.find({}).populate('user').lean();
  }

  async deleteAllToken(): Promise<any> {
    return this.authTokenModel.deleteMany({}).lean();
  }

  async deleteTokenByUser(email: string): Promise<any> {
    return this.authTokenModel.deleteOne({ email }).lean();
  }
}
