import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AppConfig } from '../../app.config';
import * as bcrypt from 'bcrypt';
import { NextFunction } from 'express';

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
      expiration: Date,
    },
    _id: false,
    default: { status: true, expiration: Date.now() + 1000 * 60 * 60 * 24 },
  })
  locked: {
    status: boolean;
    expiration: Date;
  };
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
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next: NextFunction) {
  const saltRound = Number(AppConfig.get('SALT_ROUND'));
  this.password_hash = await bcrypt.hash(this.password_hash, saltRound);
  this.email_verified.verification_code = [...Array(4)]
    .map(() => Math.floor(Math.random() * 10))
    .join('');
  next();
});
