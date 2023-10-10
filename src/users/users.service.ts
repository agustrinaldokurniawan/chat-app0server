import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUserDto';
import { VerificationEmailDto } from './dto/verificationEmailDto';
import { AppConfig } from 'src/app.config';
import * as bcrypt from 'bcrypt';
import { AppConstants } from 'src/app.constants';
import * as dayjs from 'dayjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltRound = Number(AppConfig.get('SALT_ROUND'));
    const password_hash = await bcrypt.hash(createUserDto.password, saltRound);
    const verification_code = [...Array(4)]
      .map(() => Math.floor(Math.random() * 10))
      .join('');

    const createdUser = new this.userModel({
      ...createUserDto,
      password_hash,
      'email_verified.verification_code': verification_code,
    });
    return createdUser.save();
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).lean();
  }

  async verificationEmail(
    verificationEmailDto: VerificationEmailDto,
  ): Promise<any> {
    const user = await this.userModel
      .findOne({ email: verificationEmailDto.email })
      .exec();
    if (!user)
      throw new NotFoundException({
        content: {
          message: 'Email is not found',
          data: {
            email: verificationEmailDto.email,
          },
        },
      });
    if (user.email_verified?.status)
      throw new ForbiddenException({
        content: {
          message: 'Email is verified',
          data: {
            email: verificationEmailDto.email,
          },
        },
      });
    if (
      user.email_verified?.verification_code !==
      verificationEmailDto.verification_code
    )
      throw new BadRequestException({
        content: {
          message: 'Verification code is wrong',
        },
      });

    user.email_verified.status = true;
    user.email_verified.verification_code = null;

    return user.save();
  }

  async deleteUser(email: string): Promise<any> {
    return this.userModel.findOneAndDelete({ email }).lean();
  }

  async listUsers(): Promise<User[]> {
    return this.userModel.find({}).lean();
  }

  async validateWrongPassword(email: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();
    user.try_login.limit -= 1;
    await user.save();

    if (user.try_login.limit < 1) {
      const expiredTime = dayjs().add(1, 'minute');
      user.try_login.expired = expiredTime.toDate();
      user.try_login.locked = true;
      await user.save();
      throw new BadRequestException({
        content: {
          message: 'User is locked',
          expired: expiredTime,
        },
      });
    }
    throw new UnauthorizedException({
      content: {
        message: 'Wrong password',
        try_limit: user.try_login.limit,
      },
    });
  }

  async resetTryLoginLimit(email: string): Promise<any> {
    return this.userModel.findOneAndUpdate(
      { email },
      {
        $set: {
          'try_login.limit': AppConstants.try_login_limit,
          'try_login.expired': null,
          'try_login.locked': false,
        },
      },
    );
  }
}
