import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfig } from './app.config';
import { BaseConfig } from './config/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  controllers: [AppController],
  providers: [AppService, AppConfig],
  imports: [...BaseConfig, AuthModule, UsersModule],
})
export class AppModule {}
