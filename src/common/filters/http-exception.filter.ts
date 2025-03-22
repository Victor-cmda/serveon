import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : { 
            statusCode: status,
            message: exception.message || 'Erro interno do servidor',
            error: exception.name || 'InternalServerError',
          };

    // Log do erro com informações detalhadas
    this.logger.error({
      message: `${request.method} ${request.url}`,
      status,
      error: exception.message,
      stack: exception.stack,
    });

    // Formatação da resposta de erro
    const errorResponse = {
      ...(typeof responseMessage === 'object' ? responseMessage : { message: responseMessage }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}