import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseFormatterInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    var response = context.switchToHttp().getResponse();
    var responseFormatter = {
      meta: {
        code: response.statusCode,
        status: 'success',
        messages: null,
        validations: null,
      },
      data: null,
    }
    return next.handle().pipe(
      //For Success Response
      map((data) => {
        responseFormatter.data = data;

        return responseFormatter
      }),
      catchError(err => {
        responseFormatter.meta.code = err.status;
        responseFormatter.meta.status = 'error';
        responseFormatter.meta.messages = err.message;

        //For Bad Request
        if (err.status == 400) {
          const messages = err.response.message || null;
          if (!Array.isArray(messages) && typeof messages !== 'object') {
            responseFormatter.meta['messages'] = messages;
          } else {
            const customMessages = {};
            messages.forEach(message => {
              const index = message.slice(0, message.indexOf(' '))
              const customMessage = message.replace(index + ' ', "");
              if (!customMessages[index]) {
                customMessages[index] = [];
              }
              customMessages[index].push(customMessage);
            });

            responseFormatter.meta['messages'] = null
            responseFormatter.meta['validations'] = customMessages
          }
        }

        throw new HttpException(responseFormatter, err.status);
      })
    );
  }
}
