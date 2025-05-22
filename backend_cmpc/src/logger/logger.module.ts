import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
import * as winston from 'winston';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize({ all: true }),
            winston.format.printf(({ level, message, timestamp, context }) => {
              return `[${timestamp}] [${level}]${context ? ' [' + context + ']' : ''} ${message}`;
            }),
        ),
        }),
        new transports.File({
          filename: 'logs/audit.log',
          level: 'info',
          format: format.combine(
            format.timestamp(),
            format.json()
          ),
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
