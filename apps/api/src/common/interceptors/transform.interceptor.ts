import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponseShape<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponseShape<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseShape<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data?.data ?? data,
        message: data?.message ?? 'Success',
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
