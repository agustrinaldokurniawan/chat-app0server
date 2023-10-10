import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AppConstants } from 'src/app.constants';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;
  @Prop({ unique: true })
  email: string;
  @Prop()
  password_hash: string;
  @Prop({
    type: {
      status: Boolean,
      verification_code: String,
    },
    default: {
      status: false,
    },
    _id: false,
  })
  email_verified: {
    status: boolean;
    verification_code: string;
  };
  @Prop({
    _id: false,
    type: {
      limit: Number,
      expired: Date,
      locked: Boolean,
    },
    default: {
      limit: AppConstants.try_login_limit,
      locked: false,
    },
  })
  try_login: {
    limit: number;
    expired: Date;
    locked: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
