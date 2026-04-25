import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ResponseFormat<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data) => {
        // If data already has standard format (like some auth service returns)
        if (data && typeof data === 'object' && 'message' in data && Object.keys(data).length === 1) {
          return {
            success: true,
            statusCode,
            message: data.message,
            data: null as any,
          };
        }

        let message = 'Operation successful';
        if (data && typeof data === 'object' && 'message' in data) {
           message = data.message;
           delete data.message;
        }

        // if the remaining data is empty, set to null
        const finalData = (data && Object.keys(data).length > 0) ? data : null;

        return {
          success: true,
          statusCode,
          message,
          data: finalData as T,
        };
      }),
    );
  }
}
