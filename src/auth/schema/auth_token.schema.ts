import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AppConstants } from 'src/app.constants';
import { AuthTokenEnum } from '../enum/auth_token.enum';

export type AuthTokenDocument = HydratedDocument<AuthToken>;

@Schema({ timestamps: true })
export class AuthToken {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
  @Prop()
  token: string;
  @Prop({
    type: String,
    enum: AuthTokenEnum,
    default: AuthTokenEnum.ACCESS_TOKEN,
  })
  type: string;
}

export const AuthTokenSchema = SchemaFactory.createForClass(AuthToken);
