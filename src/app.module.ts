/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import * as Joi from 'joi';

import { PrismaModule } from './common/prisma/prisma.module';
import { MailModule } from './common/mail/mail.module';
import { AuthModule } from './module/auth/auth.module';
import { FileUploadModule } from './common/file-upload/file-upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().required(),
        MAIL_USER: Joi.string().required(),
        MAIL_PASS: Joi.string().required(),
        MAIL_FROM: Joi.string().required(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
    PrismaModule,
    MailModule,
    AuthModule,
    FileUploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
