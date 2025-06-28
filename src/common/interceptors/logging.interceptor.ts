import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, params, query, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const ipAddress = this.getClientIp(request);

    // Logging exibe método, URL, IP, e remove informações sensíveis do body quando for um POST
    const sanitizedBody =
      method === 'POST' || method === 'PUT' || method === 'PATCH'
        ? this.sanitizeBody(body)
        : {};

    this.logger.log({
      message: `Requisição recebida`,
      method,
      url,
      ipAddress,
      userAgent,
      params,
      query,
      ...(Object.keys(sanitizedBody).length > 0 && { body: sanitizedBody }),
    });

    const now = Date.now();
    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const response = context.switchToHttp().getResponse<Response>();
          const delay = Date.now() - now;

          this.logger.log({
            message: `Requisição concluída`,
            method,
            url,
            statusCode: response.statusCode,
            delay: `${delay}ms`,
          });
        },
        error: (error: any) => {
          const delay = Date.now() - now;

          this.logger.error({
            message: `Erro na requisição`,
            method,
            url,
            error: error.message,
            stack: error.stack,
            delay: `${delay}ms`,
          });
        },
      }),
    );
  }

  private getClientIp(request: Request): string {
    return (
      request.ip ||
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      'unknown'
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return {};

    // Criar uma cópia para não modificar o objeto original
    const sanitized = { ...body };

    // Remover campos sensíveis
    const sensitiveFields = [
      'password',
      'senha',
      'token',
      'secret',
      'apiKey',
      'api_key',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '******';
      }
    });

    return sanitized;
  }
}
