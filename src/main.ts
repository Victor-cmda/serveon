import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as winston from 'winston';
import * as path from 'path';

async function bootstrap() {
  
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const loggerInstance = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp, context }) => {
            return `${timestamp} [Serveon] ${level}: ${message}`;
          }),
        ),
      }),
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/app.log'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        level: 'info',
      }),
      new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        level: 'error',
      }),
      new DailyRotateFile({
        filename: path.join(__dirname, '../logs/app-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: loggerInstance
  });

  const config = new DocumentBuilder()
    .setTitle('Serveon')
    .setDescription('Documentação Serveon API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);


  fs.writeFileSync('./openapi-spec.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
