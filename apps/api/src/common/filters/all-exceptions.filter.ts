// archivo: apps/api/src/common/filters/all-exceptions.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const errorId = randomUUID();

    const isHttpError = exception instanceof HttpException;
    const status = isHttpError
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Errores esperados (400, 404, 429...): se responde el mensaje de Nest
    // Errores inesperados (500): mensaje genérico, nunca detalles internos
    const message = isHttpError
      ? this.extractMessage(exception)
      : 'Ocurrió un error interno. Comunícate con soporte indicando el código.';

    if (status >= 500) {
      this.logger.error(
        `[${errorId}] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      errorId,
      message,
      timestamp: new Date().toISOString(),
    });
  } // ← aquí termina catch()

  // Método aparte, al mismo nivel que catch()
  private extractMessage(exception: HttpException): string | string[] {
    const body = exception.getResponse();
    if (typeof body === 'string') return body;
    if (typeof body === 'object' && body !== null && 'message' in body) {
      return (body as { message: string | string[] }).message;
    }
    return exception.message;
  }
} // ← aquí termina la clase