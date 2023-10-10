import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';

export const BaseConfig = [
  ConfigModule.forRoot({
    validationSchema: Joi.object({
      NODE_ENV: Joi.string().valid('dev', 'prod').default('dev'),
    }),
    envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
    isGlobal: true,
  }),
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      uri: configService.get<string>('MONGODB_URL'),
    }),
    inject: [ConfigService],
  }),
];
