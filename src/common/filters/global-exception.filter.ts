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
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorResponse: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || exception.message;
      errorResponse = res;
    } else if (
      exception &&
      typeof exception === 'object' &&
      'code' in exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    ) {
      const prismaError = exception as any;
      // Handle Prisma specific errors
      switch (prismaError.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = `Unique constraint failed on field: ${(prismaError.meta?.target as string[])?.join(', ') || 'unknown'}`;
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Database error: ${prismaError.message?.split('\\n')?.pop() || 'Unknown DB Error'}`;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message, // Handle validation error arrays
      error: errorResponse?.error || HttpStatus[status],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
