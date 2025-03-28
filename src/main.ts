import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as winston from 'winston';
import * as path from 'path';
import * as express from 'express';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { INestApplication } from '@nestjs/common';

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

  app.enableCors({
    origin: [
      'https://serveon-k32xgjzn9-victor-cmdas-projects.vercel.app',
      'http://localhost:5173'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  app.setGlobalPrefix('api');

  configureGlobalPipes(app);
  configureGlobalFilters(app);
  configureSwagger(app);

  app.use(express.static(path.join(__dirname, '..', 'wwwroot')));

  app.use((req, res, next) => {
    if (req.originalUrl && !req.originalUrl.startsWith('/api/') && !req.originalUrl.startsWith('/api/docs')) {
      return res.sendFile(path.join(__dirname, '..', 'wwwroot', 'index.html'));
    }
    next();
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  loggerInstance.log(`Aplicação iniciada na porta ${port}`, 'Bootstrap');
}

function configureGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe(),
  );
}

function configureGlobalFilters(app: INestApplication) {
  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );
}

function configureSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Serveon API')
    .setDescription('API RESTful para o sistema Serveon')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  fs.writeFileSync('./openapi-spec.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('api/docs', app, document);
}

bootstrap();
